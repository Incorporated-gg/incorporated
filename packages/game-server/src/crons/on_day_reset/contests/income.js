import mysql from '../../../lib/mysql'
import { getUserDailyIncome } from '../../../lib/db/users'

// Has to return an array of objects containing { score, user_id }
export async function getIncomeScoreboard(weekFirstServerDay) {
  const startServerDay = weekFirstServerDay
  const endServerDay = startServerDay + 7

  const allUsers = await mysql.query(
    `SELECT user_id, daily_income as initial_daily_income FROM users_daily_log WHERE server_day>=? AND server_day<? GROUP BY user_id ORDER BY server_day ASC`,
    [startServerDay, endServerDay]
  )

  const allUsersIncome = await Promise.all(allUsers.map(u => getUserDailyIncome(u.user_id)))
  allUsers.forEach((user, index) => {
    user.income_diff = allUsersIncome[index] - user.initial_daily_income
  })

  return allUsers
    .sort((a, b) => {
      return a.income_diff > b.income_diff ? -1 : 1
    })
    .slice(0, 30)
    .map(row => ({
      user_id: row.user_id,
      score: row.income_diff,
    }))
}
