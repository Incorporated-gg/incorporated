import mysql from '../../../lib/mysql'
import { getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'

// Has to return an array of objects containing { score, user_id }
export async function getRobbingScoreboard(weekFirstServerDay) {
  const startDate = getInitialUnixTimestampOfServerDay(weekFirstServerDay) / 1000
  const endDate = startDate + 60 * 60 * 24 * 7

  const allAttacks = await mysql.query(
    "SELECT user_id, data FROM missions WHERE completed=1 AND mission_type='attack' AND will_finish_at>=? AND will_finish_at<? AND profit>0",
    [startDate, endDate]
  )

  const usersRobbedMoney = {}
  allAttacks.forEach(attack => {
    try {
      const userID = attack.user_id
      const robbedMoney = JSON.parse(attack.data).report.income_from_robbed_money

      if (!usersRobbedMoney[userID]) usersRobbedMoney[userID] = robbedMoney
      else usersRobbedMoney[userID] += robbedMoney
    } catch (e) {
      console.error('[getRobbingScoreboard]', e.message)
    }
  })

  return Object.entries(usersRobbedMoney)
    .sort((a, b) => {
      return a[1] > b[1] ? -1 : 1
    })
    .slice(0, 30)
    .map(([userID, robbedMoney]) => ({
      user_id: userID,
      score: robbedMoney,
    }))
}
