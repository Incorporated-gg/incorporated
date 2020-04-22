import mysql from '../../../lib/mysql'
import { getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'
import { personnelObj } from 'shared-lib/personnelUtils'

// Has to return an array of objects containing { score, user_id }
export async function getDestructionScoreboard(weekFirstServerDay) {
  const startDate = getInitialUnixTimestampOfServerDay(weekFirstServerDay) / 1000
  const endDate = startDate + 60 * 60 * 24 * 7

  const allAttacks = await mysql.query(
    "SELECT user_id, data FROM missions WHERE completed=1 AND mission_type='attack' AND will_finish_at>=? AND will_finish_at<? AND profit>0",
    [startDate, endDate]
  )

  const usersMoneyGained = {}
  allAttacks.forEach(attack => {
    try {
      const userID = attack.user_id
      const attackReport = JSON.parse(attack.data).report
      const incomeFromBuildings = attackReport.income_from_buildings
      const lostOnTroops =
        attackReport.killed_sabots * personnelObj.sabots.price +
        attackReport.killed_thieves * personnelObj.thieves.price
      const gained = incomeFromBuildings - lostOnTroops
      if (gained <= 0) return

      if (!usersMoneyGained[userID]) usersMoneyGained[userID] = gained
      else usersMoneyGained[userID] += gained
    } catch (e) {
      console.error('[getDestructionScoreboard]', e.message)
    }
  })

  return Object.entries(usersMoneyGained)
    .sort((a, b) => {
      return a[1] > b[1] ? -1 : 1
    })
    .slice(0, 30)
    .map(([userID, gainedMoney]) => ({
      user_id: userID,
      score: gainedMoney,
    }))
}
