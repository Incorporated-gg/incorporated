import mysql from '../../lib/mysql'

export default async function runJustAfterNewDay(finishedServerDay) {
  await updateAttacksLeft()
  await updateUsersDailyLog(finishedServerDay)
}

const MAX_ACCUMULATED_ATTACKS = process.env.NODE_ENV === 'development' ? 60 : 6
const ATTACKS_GAINED_PER_DAY = process.env.NODE_ENV === 'development' ? 30 : 3

async function updateAttacksLeft() {
  await mysql.query('UPDATE users SET attacks_left=? WHERE attacks_left>=?', [
    MAX_ACCUMULATED_ATTACKS,
    MAX_ACCUMULATED_ATTACKS - ATTACKS_GAINED_PER_DAY,
  ])
  await mysql.query('UPDATE users SET attacks_left=attacks_left+? WHERE attacks_left<?', [
    ATTACKS_GAINED_PER_DAY,
    MAX_ACCUMULATED_ATTACKS - ATTACKS_GAINED_PER_DAY,
  ])
}

async function updateUsersDailyLog(finishedServerDay) {
  const users = await getAllUsers()
  await Promise.all(
    users.map(async user => {
      await mysql.query(
        'INSERT INTO users_daily_log (server_day, user_id, daily_income, researchs_count) VALUES (?, ?, ?, ?)',
        [finishedServerDay, user.user_id, user.daily_income, user.researchs_count]
      )
    })
  )
}

async function getAllUsers() {
  const users = await mysql.query(
    'SELECT user_id, points, (SELECT SUM(level) FROM research WHERE user_id=ranking_income.user_id) as researchs_count FROM ranking_income'
  )
  return users.map(rankUser => ({
    user_id: rankUser.user_id,
    daily_income: rankUser.points || 0,
    researchs_count: rankUser.researchs_count || 0,
  }))
}
