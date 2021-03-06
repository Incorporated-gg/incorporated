import mysql from '../../../src/lib/mysql'
import { getAllianceMembers } from '../../../src/lib/db/alliances'
import { getServerDay, getInitialUnixTimestampOfServerDay } from '../../../src/lib/serverTime'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import { WAR_DAYS_DURATION } from 'shared-lib/allianceUtils'
import { endWar } from './endWar'
import { getWarData } from '../../../src/lib/db/alliances/war'

const EXTRA_POINTS_PER_OBJECTIVE = 40
const WAR_POINTS_LIMIT_FOR_AUTOFINISH = WAR_DAYS_DURATION * 50 + 1 + EXTRA_POINTS_PER_OBJECTIVE * 3
const AID_MULTIPLIER = 0.3

export default async function runJustAfterNewDay(finishedServerDay) {
  const activeWars = await getAllActiveWars()
  await Promise.all(
    activeWars.map(warData => {
      return updateWarDayData(finishedServerDay + 1, warData, true)
    })
  )
}

export async function onNewWarAttack(warID) {
  const warData = await getWarData(warID, { includeRawData: true })
  await updateWarDayData(getServerDay(), warData, false)
}

async function getAllActiveWars() {
  const activeWars = await mysql.query('SELECT id FROM alliances_wars WHERE completed=0')
  return Promise.all(activeWars.map(war => getWarData(war.id, { includeRawData: true })))
}

async function updateWarDayData(serverDay, warData, isRunningAtEndOfDay) {
  const warDay = serverDay - getServerDay(warData.created_at * 1000)
  if (warDay <= 0) return // War hasn't started yet
  if (warDay > WAR_DAYS_DURATION) {
    await endWar(warData)
    return
  }

  // Get day war data
  const firstTsOfDay = getInitialUnixTimestampOfServerDay(getServerDay(warData.created_at * 1000) + warDay) / 1000
  const membersAlliance1 = (await getAllianceMembers(warData.alliance1.id)).map(m => m.user.id)
  const membersAlliance2 = (await getAllianceMembers(warData.alliance2.id)).map(m => m.user.id)

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
      allianceID: warData.alliance1.id,
      firstTsOfDay,
      attacksSent: attacksAlliance1,
      attacksReceived: attacksAlliance2,
      enemyMembers: membersAlliance2,
      ownAids: warData.alliance1_aids,
    }),
    getAllianceDayData({
      allianceID: warData.alliance2.id,
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

async function getAllianceDayData({ allianceID, firstTsOfDay, attacksSent, attacksReceived, enemyMembers, ownAids }) {
  // Calc daily points from own attacks
  const dailyPointsByAlliance = {
    [allianceID]: attacksSent.map(attackToPoints).reduce((prev, curr) => prev + curr, 0),
  }

  // Calc daily points from aiding alliances
  const aidingPlayers = (
    await Promise.all(
      ownAids
        .filter(({ accepted_at: acceptedAt }) => acceptedAt >= firstTsOfDay)
        .map(async ({ alliance }) => {
          const alliMembers = await getAllianceMembers(alliance.id)
          return alliMembers.map(m => ({
            allianceID: alliance.id,
            userID: m.user.id,
          }))
        })
    )
  ).flat()
  const aidAttacks = await getAttacksFromUsers({
    userIDs: aidingPlayers.map(aid => aid.userID),
    attackedUserIDs: enemyMembers,
    minTs: firstTsOfDay,
    maxTs: firstTsOfDay + 60 * 60 * 24,
  })
  aidAttacks.forEach(attack => {
    const attackAllianceID = aidingPlayers.find(p => p.userID === attack.user_id)
    if (!dailyPointsByAlliance[attackAllianceID]) dailyPointsByAlliance[attackAllianceID] = 0
    dailyPointsByAlliance[attackAllianceID] += attackToPoints(attack) * AID_MULTIPLIER
  })

  // Save misc data for end of war points
  const attackWins = attacksSent.filter(attack => attack.result === 'win').length
  const profit = attacksSent.map(attack => attack.profit).reduce((prev, curr) => prev + curr, 0)
  const attackSmacks = attacksReceived.filter(attack => attack.result === 'lose').length

  const dailyPoints = Object.values(dailyPointsByAlliance).reduce((prev, curr) => prev + curr, 0)
  return {
    war_points: 0, // To be calculated later
    daily_points: dailyPoints,
    dailyPointsByAlliance,
    attack_wins: attackWins,
    profit: profit,
    attack_smacks: attackSmacks,
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
  const moneyLostOnSabots = attack.data.report.killed_sabots * PERSONNEL_OBJ.sabots.price
  const moneyLostOnThieves = attack.data.report.killed_thieves * PERSONNEL_OBJ.thieves.price
  const moneyLostOnTroops = moneyLostOnSabots + moneyLostOnThieves
  if (incomeFromBuildings > 0 && incomeFromBuildings > moneyLostOnTroops) {
    const efficiencyRatio = (incomeFromBuildings - moneyLostOnTroops) / incomeFromBuildings
    points += Math.floor(efficiencyRatio * 10)
  }

  return points
}
