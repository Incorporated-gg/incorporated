import mysql from '../../../lib/mysql'

// Has to return an array of objects containing { score, user_id }
export async function getIncomeScoreboard(weekFirstServerDay) {
  const startServerDay = weekFirstServerDay
  const endServerDay = startServerDay + 7

  const topUsers = await mysql.query(
    `SELECT user_id,
    (
      (SELECT daily_income FROM users_daily_log udl2 WHERE server_day>=? AND server_day<? AND udl2.user_id=users_daily_log.user_id ORDER BY server_day DESC LIMIT 1)
      -
      (SELECT daily_income FROM users_daily_log udl2 WHERE server_day>=? AND server_day<? AND udl2.user_id=users_daily_log.user_id  ORDER BY server_day LIMIT 1)
    ) as diff
    FROM users_daily_log WHERE server_day>=? AND server_day<? GROUP BY user_id ORDER BY diff DESC LIMIT 30`,
    [startServerDay, endServerDay, startServerDay, endServerDay, startServerDay, endServerDay]
  )

  return topUsers.map(row => ({
    user_id: row.user_id,
    score: row.diff,
  }))
}
