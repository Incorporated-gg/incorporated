import mysql from '../../../lib/mysql'
import { getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'

// Has to return an array of objects containing { score, user_id }
export async function getDestructionScoreboard(weekFirstServerDay) {
  const startDate = getInitialUnixTimestampOfServerDay(weekFirstServerDay) / 1000
  const endDate = startDate + 60 * 60 * 24 * 7

  const topProfiters = await mysql.query(
    "SELECT SUM(profit) AS score, user_id FROM missions WHERE completed=1 AND mission_type='attack' AND will_finish_at>=? AND will_finish_at<? GROUP BY user_id ORDER BY score DESC LIMIT 30",
    [startDate, endDate]
  )
  return topProfiters
}
