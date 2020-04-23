import mysql from '../../../lib/mysql'
import { getUserResearchs } from '../../../lib/db/users'

// Has to return an array of objects containing { score, user_id }
export async function getResearchScoreboard(weekFirstServerDay) {
  const startServerDay = weekFirstServerDay
  const endServerDay = startServerDay + 7

  const allUsers = await mysql.query(
    `SELECT user_id, researchs_count as initial_researchs_count FROM users_daily_log WHERE server_day>=? AND server_day<? GROUP BY user_id ORDER BY server_day ASC`,
    [startServerDay, endServerDay]
  )

  const allUsersResearchs = await Promise.all(allUsers.map(u => getUserResearchs(u.user_id)))
  allUsers.forEach((user, index) => {
    const researchsCount = Object.values(allUsersResearchs[index]).reduce((prev, curr) => prev + curr, 0)
    user.researchs_count_diff = researchsCount - user.initial_researchs_count
  })

  // TODO: Score should be money spent, not number of researchs
  // Additionally, we should count currenctly active researchs

  return allUsers
    .sort((a, b) => {
      return a.researchs_count_diff > b.researchs_count_diff ? -1 : 1
    })
    .slice(0, 30)
    .map(row => ({
      user_id: row.user_id,
      score: row.researchs_count_diff,
    }))
}
