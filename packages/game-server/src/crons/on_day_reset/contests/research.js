import mysql from '../../../lib/mysql'
import { getUserResearchs } from '../../../lib/db/users'
import { calcUserResearchsTotalSpending } from '../miscUserUpdates'

// Has to return an array of objects containing { score, user_id }
export async function getResearchScoreboard(weekFirstServerDay) {
  const startServerDay = weekFirstServerDay
  const endServerDay = startServerDay + 7

  const allUsers = await mysql.query(
    `SELECT user_id, researchs_total_spending as initial_researchs_total_spending FROM users_daily_log WHERE server_day>=? AND server_day<? GROUP BY user_id ORDER BY server_day ASC`,
    [startServerDay, endServerDay]
  )

  const allUsersResearchs = await Promise.all(
    allUsers.map(u => getUserResearchs(u.user_id, { includeResearchsInProgress: true }))
  )
  allUsers.forEach((user, index) => {
    const totalSpendingNew = calcUserResearchsTotalSpending(allUsersResearchs[index])
    user.contest_score = (totalSpendingNew - BigInt(user.initial_researchs_total_spending)) / 100000n
  })

  return allUsers
    .sort((a, b) => {
      return a.contest_score > b.contest_score ? -1 : 1
    })
    .slice(0, 100)
    .map(row => ({
      user_id: row.user_id,
      score: row.contest_score,
    }))
}
