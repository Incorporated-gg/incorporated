import mysql from '../../lib/mysql'

export default async function runJustAfterNewDay(finishedServerDay) {
  const users = await getAllUsers()
  await Promise.all(
    users.map(async user => {
      await mysql.query('INSERT INTO users_daily_log (server_day, user_id, daily_income) VALUES (?, ?, ?)', [
        finishedServerDay,
        user.user_id,
        user.daily_income,
      ])
    })
  )
}

async function getAllUsers() {
  const users = await mysql.query('SELECT user_id, points FROM ranking_income')
  return users.map(rankUser => ({
    user_id: rankUser.user_id,
    daily_income: rankUser.points,
  }))
}
