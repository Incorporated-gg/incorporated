const mysql = require('../lib/mysql')
const alliances = require('../lib/db/alliances')
const { sendMessage } = require('../lib/db/users')
const frequencyMs = 5 * 60 * 1000

const run = async () => {
  const activeWars = await getAllActiveWars()
  await Promise.all(activeWars.map(executeNewDayForWar))
}

module.exports = {
  run,
  frequencyMs,
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

function getDayFirstTimestampFromDate(date) {
  const dayStartDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const firstTimestamp = Math.floor(dayStartDate.getTime() / 1000)
  return firstTimestamp
}

const WAR_DAYS_DURATION = 5
async function executeNewDayForWar(war) {
  if (!war.data) war.data = { days: {} }

  const firstTsToday = getDayFirstTimestampFromDate(new Date())

  const firstTsWarCreatedAt = getDayFirstTimestampFromDate(new Date(war.created_at * 1000))

  const secondsElapsed = firstTsToday - firstTsWarCreatedAt
  const warDay = Math.round(secondsElapsed / 60 / 60 / 24)

  if (warDay === 0) {
    // This day does not count, as the war was declared today
    return
  }

  // Get attacks today, calc scores, and save them
  const membersAlliance1 = (await alliances.getMembers(war.alliance1_id)).map(m => m.user.id)
  const membersAlliance2 = (await alliances.getMembers(war.alliance2_id)).map(m => m.user.id)

  // End war if appropiate
  if (warDay > WAR_DAYS_DURATION) {
    await endWar(war, membersAlliance1, membersAlliance2)
    return
  }

  // Calc daily points
  const attacksAlliance1 = await getAttacksFromUsers(membersAlliance1, membersAlliance2, firstTsToday)
  const attacksAlliance2 = await getAttacksFromUsers(membersAlliance2, membersAlliance1, firstTsToday)

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
    warPointsAlliance1 = Math.round(dailyPointsAlliance1 / totalDailyPoints * 100)
    warPointsAlliance2 = Math.round(dailyPointsAlliance2 / totalDailyPoints * 100)
  }

  // Save war points
  war.data.days[warDay] = {
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
    'SELECT target_user, result, profit, data FROM missions WHERE mission_type="attack" AND completed=1 AND will_finish_at>? AND will_finish_at<? AND user_id IN (?) AND target_user IN (?)',
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

async function endWar(war, membersAlliance1, membersAlliance2) {
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
