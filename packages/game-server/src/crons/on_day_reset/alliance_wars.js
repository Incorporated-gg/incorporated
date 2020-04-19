import mysql from '../../lib/mysql'
import { getMembers, getBasicData as getAllianceBasicData, getWarData } from '../../lib/db/alliances'
import { sendAccountHook } from '../../lib/accountInternalApi'
import { sendMessage } from '../../lib/db/users'
import { getServerDay, getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'
import { personnelObj } from 'shared-lib/personnelUtils'
import { WAR_DAYS_DURATION } from 'shared-lib/allianceUtils'

const EXTRA_POINTS_PER_OBJECTIVE = 40
const WAR_POINTS_LIMIT_FOR_AUTOFINISH = WAR_DAYS_DURATION * 50 + 1 + EXTRA_POINTS_PER_OBJECTIVE * 3

export default async function runJustAfterNewDay() {
  const activeWars = await getAllActiveWars()
  await Promise.all(
    activeWars.map(warData => {
      return updateWarDayData(warData, true)
    })
  )
}

export async function onNewWarAttack(warID) {
  const warData = await getWarData(warID, { includeRawData: true })
  await updateWarDayData(warData, false)
}

async function getAllActiveWars() {
  const activeWars = await mysql.query('SELECT id FROM alliances_wars WHERE completed=0')
  return Promise.all(activeWars.map(war => getWarData(war.id, { includeRawData: true })))
}

async function updateWarDayData(warData, isRunningAtEndOfDay) {
  const warDay = getServerDay() - getServerDay(warData.created_at * 1000)

  if (warDay <= 0) return // Attack done before war started
  if (warDay > WAR_DAYS_DURATION) {
    await endWar(warData)
    return
  }

  // Get day war data
  const firstTsOfDay = getInitialUnixTimestampOfServerDay(getServerDay(warData.created_at * 1000) + warDay) / 1000

  const membersAlliance1 = (await getMembers(warData.alliance1.id)).map(m => m.user.id)
  const membersAlliance2 = (await getMembers(warData.alliance2.id)).map(m => m.user.id)

  const attacksAlliance1 = await getAttacksFromUsers({
    userIDs: membersAlliance1,
    attackedUserIDs: membersAlliance2,
    minTs: firstTsOfDay,
    maxTs: firstTsOfDay + 60 * 60 * 24,
  })
  const attacksAlliance2 = await getAttacksFromUsers({
    userIDs: membersAlliance2,
    attackedUserIDs: membersAlliance1,
    minTs: firstTsOfDay,
    maxTs: firstTsOfDay + 60 * 60 * 24,
  })

  const [alliance1Day, alliance2Day] = await Promise.all([
    getAllianceDayData({
      firstTsOfDay,
      attacksSent: attacksAlliance1,
      attacksReceived: attacksAlliance2,
      enemyMembers: membersAlliance2,
      ownAids: warData.alliance1_aids,
    }),
    getAllianceDayData({
      firstTsOfDay,
      attacksSent: attacksAlliance2,
      attacksReceived: attacksAlliance1,
      enemyMembers: membersAlliance1,
      ownAids: warData.alliance2_aids,
    }),
  ])

  // Calc war points from this day
  const { warPointsAlliance1: todayWarPointsAlliance1, warPointsAlliance2: todayWarPointsAlliance2 } = calcDayWarPoints(
    alliance1Day,
    alliance2Day
  )
  alliance1Day.war_points = todayWarPointsAlliance1
  alliance2Day.war_points = todayWarPointsAlliance2

  // Save day data
  warData._data.days[warDay] = {
    alliance1: alliance1Day,
    alliance2: alliance2Day,
  }

  await mysql.query('UPDATE alliances_wars SET data=? WHERE id=?', [JSON.stringify(warData._data), warData.id])

  if (isRunningAtEndOfDay) {
    // End war if one alliance has mathematically no way left to win
    const warPointsAlliance1 = Object.values(warData._data.days).reduce(
      (prev, curr) => prev + curr.alliance1.war_points,
      0
    )
    const warPointsAlliance2 = Object.values(warData._data.days).reduce(
      (prev, curr) => prev + curr.alliance2.war_points,
      0
    )
    if (
      warPointsAlliance1 >= WAR_POINTS_LIMIT_FOR_AUTOFINISH ||
      warPointsAlliance2 >= WAR_POINTS_LIMIT_FOR_AUTOFINISH
    ) {
      await endWar(warData)
    }
  }
}

function calcDayWarPoints(alliance1Day, alliance2Day) {
  let warPointsAlliance1 = 50
  let warPointsAlliance2 = 50
  if (alliance1Day.daily_points !== alliance2Day.daily_points) {
    let dailyPointsAlliance1 = alliance1Day.daily_points
    let dailyPointsAlliance2 = alliance2Day.daily_points
    // Avoid alliances having negative points if necessary, shifting them to 0 by adding them to the other alliance
    if (dailyPointsAlliance1 < 0) {
      dailyPointsAlliance2 -= dailyPointsAlliance1
      dailyPointsAlliance1 = 0
    }
    if (dailyPointsAlliance2 < 0) {
      dailyPointsAlliance1 -= dailyPointsAlliance2
      dailyPointsAlliance2 = 0
    }
    const totalDailyPoints = dailyPointsAlliance1 + dailyPointsAlliance2
    warPointsAlliance1 = Math.round((dailyPointsAlliance1 / totalDailyPoints) * 100)
    warPointsAlliance2 = Math.round((dailyPointsAlliance2 / totalDailyPoints) * 100)
  }
  return { warPointsAlliance1, warPointsAlliance2 }
}

async function getAllianceDayData({ firstTsOfDay, attacksSent, attacksReceived, enemyMembers, ownAids }) {
  // Calc daily points from own attacks
  let dailyPoints = attacksSent.map(attackToPoints).reduce((prev, curr) => prev + curr, 0)

  // Calc daily points from aiding alliances
  const aidingData = await getAidingAllianceData(firstTsOfDay, ownAids)
  const aidAttacks = await getAttacksFromUsers({
    userIDs: aidingData.userIDs,
    attackedUserIDs: enemyMembers,
    minTs: firstTsOfDay,
    maxTs: firstTsOfDay + 60 * 60 * 24,
  })

  const countMultipliers = { 1: 0.3, 2: 0.2, 3: 0.15 }
  const aidMultiplier = countMultipliers[aidingData.alliancesCount] || 0

  dailyPoints = dailyPoints + aidMultiplier * aidAttacks.map(attackToPoints).reduce((prev, curr) => prev + curr, 0)

  // Save misc data for end of war points
  const attackWins = attacksSent.filter(attack => attack.result === 'win').length
  const profit = attacksSent.map(attack => attack.profit).reduce((prev, curr) => prev + curr, 0)
  const attackSmacks = attacksReceived.filter(attack => attack.result === 'lose').length

  return {
    war_points: 0, // To be calculated later
    daily_points: dailyPoints,
    attack_wins: attackWins,
    profit: profit,
    attack_smacks: attackSmacks,
  }
}

async function getAidingAllianceData(firstTsOfDay, allianceAids) {
  allianceAids = allianceAids.filter(({ accepted_at: acceptedAt }) => acceptedAt >= firstTsOfDay)

  const members = await Promise.all(
    allianceAids.map(async ({ alliance }) => {
      return (await getMembers(alliance.id)).map(m => m.user.id)
    })
  )

  return {
    alliancesCount: allianceAids.length,
    userIDs: members.flat(),
  }
}

async function getAttacksFromUsers({ userIDs, attackedUserIDs, minTs, maxTs }) {
  if (!attackedUserIDs.length || !userIDs.length) return []

  const attacks = await mysql.query(
    'SELECT user_id, target_user, result, profit, data FROM missions WHERE mission_type="attack" AND completed=1 AND will_finish_at>=? AND will_finish_at<? AND user_id IN (?) AND target_user IN (?)',
    [minTs, maxTs, userIDs, attackedUserIDs]
  )
  return attacks.map(attack => {
    attack.data = JSON.parse(attack.data)
    return attack
  })
}

function attackToPoints(attack) {
  let points = 0
  if (attack.result === 'win') points += 10
  if (attack.result === 'lose') points -= 30

  // Extra point for efficiency
  const incomeFromBuildings = attack.data.report.income_from_buildings
  const moneyLostOnSabots = attack.data.report.killed_sabots * personnelObj.sabots.price
  const moneyLostOnThieves = attack.data.report.killed_thieves * personnelObj.thieves.price
  const moneyLostOnTroops = moneyLostOnSabots + moneyLostOnThieves
  if (incomeFromBuildings > 0 && incomeFromBuildings > moneyLostOnTroops) {
    const efficiencyRatio = (incomeFromBuildings - moneyLostOnTroops) / incomeFromBuildings
    points += Math.floor(efficiencyRatio * 10)
  }

  return points
}

async function endWar(warData) {
  const alliance1UserIDs = (await getMembers(warData.alliance1.id)).map(m => m.user.id)
  const alliance2UserIDs = (await getMembers(warData.alliance2.id)).map(m => m.user.id)

  const days = Object.values(warData._data.days)

  let warPointsAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.war_points, 0)
  let warPointsAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.war_points, 0)

  // Extra points
  const attackWinsAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.attack_wins, 0)
  const attackWinsAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.attack_wins, 0)
  if (attackWinsAlliance1 !== attackWinsAlliance2) {
    if (attackWinsAlliance1 > attackWinsAlliance2) warPointsAlliance1 += EXTRA_POINTS_PER_OBJECTIVE
    else warPointsAlliance2 += EXTRA_POINTS_PER_OBJECTIVE
  }
  const profitAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.profit, 0)
  const profitAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.profit, 0)
  if (profitAlliance1 !== profitAlliance2) {
    if (profitAlliance1 > profitAlliance2) warPointsAlliance1 += EXTRA_POINTS_PER_OBJECTIVE
    else warPointsAlliance2 += EXTRA_POINTS_PER_OBJECTIVE
  }
  const attackSmacksAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.attack_smacks, 0)
  const attackSmacksAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.attack_smacks, 0)
  if (attackSmacksAlliance1 !== attackSmacksAlliance2) {
    if (attackSmacksAlliance1 > attackSmacksAlliance2) warPointsAlliance1 += EXTRA_POINTS_PER_OBJECTIVE
    else warPointsAlliance2 += EXTRA_POINTS_PER_OBJECTIVE
  }

  const winner = warPointsAlliance1 > warPointsAlliance2 ? 1 : 2
  warData._data.winner = winner

  if (winner === 1) {
    // The attacker won. Change hoods owner
    const attackerAllianceData = await getAllianceBasicData(warData.alliance1.id)
    warData.alliance1_hoods.forEach(hood => {
      hood.owner = attackerAllianceData // Changes global hoods object
    })
    const hoodIDs = warData.alliance1_hoods.map(hood => hood.id)
    await mysql.query('UPDATE hoods SET owner=? WHERE id IN (?)', [warData.alliance1.id, hoodIDs])
  } else {
    // The defensor won. Change hoods owner
    const defenderAllianceData = await getAllianceBasicData(warData.alliance2.id)
    warData.alliance2_hoods.forEach(hood => {
      hood.owner = defenderAllianceData // Changes global hoods object
    })
    const hoodIDs = warData.alliance2_hoods.map(hood => hood.id)
    await mysql.query('UPDATE hoods SET owner=? WHERE id IN (?)', [warData.alliance2.id, hoodIDs])
  }

  await mysql.query('UPDATE alliances_wars SET completed=1, data=? WHERE id=?', [
    JSON.stringify(warData._data),
    warData.id,
  ])
  await Promise.all(
    [...alliance1UserIDs, ...alliance2UserIDs].map(userID =>
      sendMessage({
        receiverID: userID,
        senderID: null,
        type: 'war_ended',
        data: { war_id: warData.id },
      })
    )
  )

  // Account hook
  sendAccountHook('war_ended', {
    winner,
    alliance1UserIDs,
    alliance2UserIDs,
    mvpPlayer: await getMvpPlayerFromWar(warData.created_at, alliance1UserIDs, alliance2UserIDs),
  })
}

async function getMvpPlayerFromWar(warCreatedAtTimestamp, alliance1UserIDs, alliance2UserIDs) {
  const firstTsOfWar = getInitialUnixTimestampOfServerDay(getServerDay(warCreatedAtTimestamp * 1000)) / 1000
  const tsNow = Math.floor(Date.now() / 1000)

  const allWarAttacks = [
    ...(await getAttacksFromUsers({
      userIDs: alliance1UserIDs,
      attackedUserIDs: alliance2UserIDs,
      minTs: firstTsOfWar,
      maxTs: tsNow,
    })),
    ...(await getAttacksFromUsers({
      userIDs: alliance2UserIDs,
      attackedUserIDs: alliance1UserIDs,
      minTs: firstTsOfWar,
      maxTs: tsNow,
    })),
  ]

  const usersTotalIncomeByID = {}

  allWarAttacks.forEach(attack => {
    if (!usersTotalIncomeByID[attack.user_id]) usersTotalIncomeByID[attack.user_id] = 0

    usersTotalIncomeByID[attack.user_id] += attack.data.report.attacker_total_income
  })

  const mvp = Object.entries(usersTotalIncomeByID).sort((a, b) => {
    return a[1] > b[1] ? -1 : 1
  })

  return parseInt(mvp[0][0])
}
