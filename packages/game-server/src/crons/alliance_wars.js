import mysql from '../lib/mysql'
import { getMembers, getBasicData as getAllianceBasicData, getWarData } from '../lib/db/alliances'
import { sendAccountHook } from '../lib/accountInternalApi'
import { sendMessage } from '../lib/db/users'
import { getServerDay, getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'
import { personnelList } from 'shared-lib/personnelUtils'
import { WAR_DAYS_DURATION } from 'shared-lib/allianceUtils'

const sabotsInfo = personnelList.find(t => t.resource_id === 'sabots')
const thievesInfo = personnelList.find(t => t.resource_id === 'thieves')

export async function runOnce() {
  // Run every server day just after reset
  const tsStartOfTomorrow = getInitialUnixTimestampOfServerDay(getServerDay() + 1)

  setTimeout(() => {
    runOnce()
    runJustAfterNewDay()
  }, tsStartOfTomorrow - Date.now() + 100)
}

export async function onNewWarAttack(warID) {
  const warData = await getWarData(warID, { includeRawData: true })
  const warDay = getServerDay() - getServerDay(warData.created_at * 1000)
  await updateWarDayData(warData, warDay)
}

async function runJustAfterNewDay() {
  const currentServerDay = getServerDay()
  const activeWars = await getAllActiveWars()
  await Promise.all(activeWars.map(warData => executeDayFinishForWar(currentServerDay, warData)))
}

async function getAllActiveWars() {
  const activeWars = await mysql.query('SELECT id FROM alliances_wars WHERE completed=0')
  return Promise.all(activeWars.map(war => getWarData(war.id, { includeRawData: true })))
}

async function executeDayFinishForWar(currentServerDay, warData) {
  const warDay = currentServerDay - getServerDay(warData.created_at * 1000)
  await updateWarDayData(warData, warDay)
}

async function updateWarDayData(warData, warDay) {
  if (warDay <= 0) return // Attack done before war started
  if (warDay > WAR_DAYS_DURATION) {
    await endWar(warData)
    return
  }

  const firstTsOfDay = getInitialUnixTimestampOfServerDay(getServerDay(warData.created_at * 1000) + warDay) / 1000

  // Get day war data
  const membersAlliance1 = (await getMembers(warData.alliance1.id)).map(m => m.user.id)
  const membersAlliance2 = (await getMembers(warData.alliance2.id)).map(m => m.user.id)

  const attacksAlliance1 = await getAttacksFromUsers(membersAlliance1, membersAlliance2, firstTsOfDay)
  const attacksAlliance2 = await getAttacksFromUsers(membersAlliance2, membersAlliance1, firstTsOfDay)

  const [alliance1Day, alliance2Day] = await Promise.all([
    getAllianceDayData({
      createdAt: warData.created_at,
      firstTsOfDay,
      attacksSent: attacksAlliance1,
      attacksReceived: attacksAlliance2,
      enemyMembers: membersAlliance2,
      ownAids: warData.alliance1_aids,
    }),
    getAllianceDayData({
      createdAt: warData.created_at,
      firstTsOfDay,
      attacksSent: attacksAlliance2,
      attacksReceived: attacksAlliance1,
      enemyMembers: membersAlliance1,
      ownAids: warData.alliance2_aids,
    }),
  ])

  // Calc war points from this day
  const { warPointsAlliance1, warPointsAlliance2 } = calcWarPoints(alliance1Day, alliance2Day)
  alliance1Day.war_points = warPointsAlliance1
  alliance2Day.war_points = warPointsAlliance2

  // Save day data
  warData._data.days[warDay] = {
    alliance1: alliance1Day,
    alliance2: alliance2Day,
  }

  await mysql.query('UPDATE alliances_wars SET data=? WHERE id=?', [JSON.stringify(warData._data), warData.id])
}

function calcWarPoints(alliance1Day, alliance2Day) {
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

async function getAllianceDayData({ createdAt, firstTsOfDay, attacksSent, attacksReceived, enemyMembers, ownAids }) {
  // Calc daily points from own attacks
  let dailyPoints = attacksSent.map(attackToPoints).reduce((prev, curr) => prev + curr, 0)

  // Calc daily points from aiding alliances
  const aidingData = await getAidingAllianceData(firstTsOfDay, ownAids)
  const aidAttacks = await getAttacksFromUsers(aidingData.userIDs, enemyMembers, firstTsOfDay)

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

async function getAttacksFromUsers(userIDs, attackedUserIDs, attacksMinTs) {
  if (!attackedUserIDs.length || !userIDs.length) return []

  const attacksMaxTs = attacksMinTs + 60 * 60 * 24
  const attacks = await mysql.query(
    'SELECT target_user, result, profit, data FROM missions WHERE mission_type="attack" AND completed=1 AND will_finish_at>=? AND will_finish_at<? AND user_id IN (?) AND target_user IN (?)',
    [attacksMinTs, attacksMaxTs, userIDs, attackedUserIDs]
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
  const moneyLostOnSabots = attack.data.report.killed_sabots * sabotsInfo.price
  const moneyLostOnThieves = attack.data.report.killed_thieves * thievesInfo.price
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
    if (attackWinsAlliance1 > attackWinsAlliance2) warPointsAlliance1 += 40
    else warPointsAlliance2 += 40
  }
  const profitAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.profit, 0)
  const profitAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.profit, 0)
  if (profitAlliance1 !== profitAlliance2) {
    if (profitAlliance1 > profitAlliance2) warPointsAlliance1 += 40
    else warPointsAlliance2 += 40
  }
  const attackSmacksAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.attack_smacks, 0)
  const attackSmacksAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.attack_smacks, 0)
  if (attackSmacksAlliance1 !== attackSmacksAlliance2) {
    if (attackSmacksAlliance1 > attackSmacksAlliance2) warPointsAlliance1 += 40
    else warPointsAlliance2 += 40
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

  sendAccountHook('war_ended', { winner, alliance1UserIDs, alliance2UserIDs })
}
