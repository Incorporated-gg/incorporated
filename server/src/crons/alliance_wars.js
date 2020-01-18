const mysql = require('../lib/mysql')
const alliances = require('../lib/db/alliances')
const { sendMessage } = require('../lib/db/users')
const { getServerDay, getInitialUnixTimestampOfServerDay } = require('shared-lib/serverTime')

const WAR_DAYS_DURATION = 5

async function runOnce() {
  // Run every server day reset
  const tsStartOfTomorrow = getInitialUnixTimestampOfServerDay(getServerDay() + 1)

  setTimeout(() => {
    setTimeout(runOnce, 24 * 60 * 60 * 1000)
    setTimeout(runNewDay, 500)
  }, tsStartOfTomorrow - Date.now())
}

async function onNewWarAttack(warID) {
  const [
    [war],
  ] = await mysql.query('SELECT id, created_at, alliance1_id, alliance2_id, data FROM alliances_wars WHERE id=?', [
    warID,
  ])
  if (!war) return
  war.data = JSON.parse(war.data)
  const warDay = getServerDay() - getServerDay(war.created_at * 1000)
  await updateWarDayData(war, warDay)
}

module.exports = {
  runOnce,
  onNewWarAttack,
}

async function runNewDay() {
  const activeWars = await getAllActiveWars()
  await Promise.all(activeWars.map(executeDayFinishForWar))
}

async function getAllActiveWars() {
  const [activeWars] = await mysql.query(
    'SELECT id, created_at, alliance1_id, alliance2_id, data FROM alliances_wars WHERE completed=0'
  )
  return activeWars.map(war => {
    war.data = JSON.parse(war.data)
    return war
  })
}

async function executeDayFinishForWar(war) {
  const warDayThatJustFinished = getServerDay() - getServerDay(war.created_at * 1000) - 1

  // Run updateWarDayData just in case there were no attacks the warDay that just finished
  await updateWarDayData(war, warDayThatJustFinished)

  // End war if appropiate
  if (warDayThatJustFinished >= WAR_DAYS_DURATION) {
    await endWar(war)
  }
}

async function updateWarDayData(war, warDay) {
  if (warDay <= 0 || warDay > WAR_DAYS_DURATION) return
  if (!war.data) war.data = { days: {} }

  // Get attacks today, calc scores, and save them
  const membersAlliance1 = (await alliances.getMembers(war.alliance1_id)).map(m => m.user.id)
  const membersAlliance2 = (await alliances.getMembers(war.alliance2_id)).map(m => m.user.id)

  // Calc daily points
  const firstTsOfDay = getInitialUnixTimestampOfServerDay(getServerDay(war.created_at * 1000) + warDay - 1) / 1000
  const attacksAlliance1 = await getAttacksFromUsers(membersAlliance1, membersAlliance2, firstTsOfDay)
  const attacksAlliance2 = await getAttacksFromUsers(membersAlliance2, membersAlliance1, firstTsOfDay)

  let dailyPointsAlliance1 = attacksAlliance1.map(attackToPoints).reduce((prev, curr) => prev + curr, 0)
  let dailyPointsAlliance2 = attacksAlliance2.map(attackToPoints).reduce((prev, curr) => prev + curr, 0)
  // Avoid alliances having negative points if necessary, shifting them to 0 by adding them to the other alliance
  if (dailyPointsAlliance1 < 0) {
    dailyPointsAlliance2 -= dailyPointsAlliance1
    dailyPointsAlliance1 = 0
  }
  if (dailyPointsAlliance2 < 0) {
    dailyPointsAlliance1 -= dailyPointsAlliance2
    dailyPointsAlliance2 = 0
  }

  // Calc war points from this day
  const totalDailyPoints = dailyPointsAlliance1 + dailyPointsAlliance2
  let warPointsAlliance1 = 50
  let warPointsAlliance2 = 50
  if (totalDailyPoints > 0) {
    warPointsAlliance1 = Math.round((dailyPointsAlliance1 / totalDailyPoints) * 100)
    warPointsAlliance2 = Math.round((dailyPointsAlliance2 / totalDailyPoints) * 100)
  }

  // Save war points
  war.data.days[warDay] = {
    daily_points_alliance1: dailyPointsAlliance1,
    daily_points_alliance2: dailyPointsAlliance2,
    war_points_alliance1: warPointsAlliance1,
    war_points_alliance2: warPointsAlliance2,
  }

  await mysql.query('UPDATE alliances_wars SET data=? WHERE id=?', [JSON.stringify(war.data), war.id])
}

async function getAttacksFromUsers(userIDs, attackedUserIDs, attacksMinTs) {
  const attacksMaxTs = attacksMinTs + 60 * 60 * 24
  const [
    attacks,
  ] = await mysql.query(
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
  if (attack.result === 'win') points += 1
  if (attack.result === 'lose') points -= 3
  // TODO: Implement actual points based on attack efficiency system
  if (attack.profit > 0) points += 1
  if (attack.attacker_total_income > 1000000) points += 1

  return points
}

async function endWar(war) {
  const membersAlliance1 = (await alliances.getMembers(war.alliance1_id)).map(m => m.user.id)
  const membersAlliance2 = (await alliances.getMembers(war.alliance2_id)).map(m => m.user.id)

  const warPointsAlliance1 = Object.values(war.data.days).reduce((prev, curr) => prev + curr.war_points_alliance1, 0)
  const warPointsAlliance2 = Object.values(war.data.days).reduce((prev, curr) => prev + curr.war_points_alliance2, 0)

  const winner = warPointsAlliance1 > warPointsAlliance2 ? 1 : 2
  war.data.winner = winner

  await mysql.query('UPDATE alliances_wars SET completed=1, data=? WHERE id=?', [JSON.stringify(war.data), war.id])
  await Promise.all(
    [...membersAlliance1, ...membersAlliance2].map(userID =>
      sendMessage({
        receiverID: userID,
        senderID: null,
        type: 'war_ended',
        data: { war_id: war.id },
      })
    )
  )
}
