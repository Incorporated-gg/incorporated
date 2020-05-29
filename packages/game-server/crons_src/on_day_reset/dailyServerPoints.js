import mysql from '../../src/lib/mysql'
import { getAllHoodsData } from '../../src/lib/db/hoods'
import { calcHoodDailyServerPoints } from 'shared-lib/hoodUtils'

export default async function runJustAfterNewDay() {
  // For Hoods
  const allHoods = await getAllHoodsData()
  await Promise.all(
    allHoods.map(async hood => {
      const allianceID = hood.owner.id
      if (!allianceID) return

      const pointsToAdd = calcHoodDailyServerPoints(hood.tier)
      await mysql.query('UPDATE alliances SET server_points=server_points+? WHERE id=?', [pointsToAdd, allianceID])
    })
  )

  // For Income
  // 1 daily server point for each 10M combined income
  const allAlliances = await mysql.query(`
    SELECT 
      id,
      (SELECT SUM(points) FROM ranking_income WHERE ranking_income.user_id IN (SELECT user_id FROM alliances_members WHERE alliances_members.alliance_id=alliances.id)) as totalIncome
    FROM alliances
  `)
  await Promise.all(
    allAlliances.map(async alliance => {
      const pointsToAdd = Math.floor(alliance.totalIncome / 10000000)
      if (!pointsToAdd) return

      await mysql.query('UPDATE alliances SET server_points=server_points+? WHERE id=?', [pointsToAdd, alliance.id])
    })
  )
}
