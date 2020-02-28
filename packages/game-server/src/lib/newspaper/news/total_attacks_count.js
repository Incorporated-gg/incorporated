import mysql from '../../mysql'
import NewsItem, { newsItemTypes } from '../NewsItem'

export async function generate({ dayID, minTimestamp, maxTimestamp }) {
  const attacksCount = await mysql.selectOne(
    'SELECT COUNT(*) as count FROM missions WHERE completed=1 AND mission_type="attack" AND will_finish_at BETWEEN ? AND ?',
    [minTimestamp, maxTimestamp]
  )

  if (attacksCount.count === 0) return []

  return [
    new NewsItem({
      type: newsItemTypes.TOTAL_ATTACKS_COUNT,
      weight: 0.1,
      data: { attacksCount: attacksCount.count },
    }),
  ]
}

export async function get({ attacksCount }) {
  return { attacks_count: attacksCount }
}
