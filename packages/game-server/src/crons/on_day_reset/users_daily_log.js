import mysql from '../../lib/mysql'

export default async function runJustAfterNewDay(finishedServerDay) {
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
