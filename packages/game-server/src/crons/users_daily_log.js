const mysql = require('../lib/mysql')
const { getServerDay, getInitialUnixTimestampOfServerDay } = require('shared-lib/serverTime')

async function runOnce() {
  // Run every server day just after reset
  const tsStartOfTomorrow = getInitialUnixTimestampOfServerDay(getServerDay() + 1)

  setTimeout(() => {
    runOnce()
    runJustAfterNewDay()
  }, tsStartOfTomorrow - Date.now() + 2000)
}

module.exports = {
  runOnce,
}

async function runJustAfterNewDay() {
  const serverDay = getServerDay() - 1

  const users = await getAllUsers()
  await Promise.all(
    users.map(async user => {
      await mysql.query('INSERT INTO users_daily_log (server_day, user_id, daily_income) VALUES (?, ?, ?)', [
        serverDay,
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
