import mysql from '../../../lib/mysql'
import { getAllianceRankData, getBasicData as getAllianceBasicData } from '../../../lib/db/alliances'
import NewsItem, { newsItemTypes, rankPositionToWeightVal } from '../NewsItem'

export async function generate({ dayID, minTimestamp, maxTimestamp }) {
  minTimestamp = minTimestamp - 3 * 60 * 60 * 24
  maxTimestamp = maxTimestamp - 3 * 60 * 60 * 24

  let allWarDeclarations = await mysql.query(
    'SELECT id, alliance1_id, alliance2_id FROM alliances_wars WHERE created_at BETWEEN ? AND ?',
    [minTimestamp, maxTimestamp]
  )
  allWarDeclarations = await Promise.all(
    allWarDeclarations.map(async war => {
      const [rank1, rank2] = await Promise.all([
        getAllianceRankData(war.alliance1_id),
        getAllianceRankData(war.alliance2_id),
      ])
      const rankWeight = (rankPositionToWeightVal(rank1.rank) + rankPositionToWeightVal(rank2.rank)) / 2
      const typeWeight = 1.6

      return new NewsItem({
        type: newsItemTypes.WAR_UPDATE_DAY_3,
        weight: rankWeight + typeWeight,
        data: { warID: war.id },
      })
    })
  )

  return allWarDeclarations
}

export async function get({ warID }) {
  const war = await mysql.selectOne('SELECT alliance1_id, alliance2_id, data FROM alliances_wars WHERE id=?', [warID])
  const warData = JSON.parse(war.data)

  const [alliance1, alliance2] = await Promise.all([
    getAllianceBasicData(war.alliance1_id),
    getAllianceBasicData(war.alliance2_id),
  ])

  const warPoints1 = Object.values(warData.days)
    .map(day => day.alliance1.war_points)
    .reduce((prev, curr) => prev + curr, 0)
  const warPoints2 = Object.values(warData.days)
    .map(day => day.alliance1.war_points)
    .reduce((prev, curr) => prev + curr, 0)

  return { alliance1, alliance2, warPoints1, warPoints2 }
}
