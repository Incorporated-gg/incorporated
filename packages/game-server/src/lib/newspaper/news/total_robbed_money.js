import mysql from '../../mysql'
import NewsItem, { newsItemTypes } from '../NewsItem'

export async function generate({ dayID, minTimestamp, maxTimestamp }) {
  const daysPeriod = Math.floor(Math.random() * (14 - 3) + 3) // [3, 14]

  minTimestamp -= 60 * 60 * 24 * daysPeriod
  const attacks = await mysql.query(
    'SELECT data FROM missions WHERE completed=1 AND mission_type="attack" AND will_finish_at BETWEEN ? AND ?',
    [minTimestamp, maxTimestamp]
  )

  let robbedMoney = attacks
    .map(attack => JSON.parse(attack.data).report.income_from_robbed_money)
    .reduce((prev, curr) => prev + curr, 0)

  if (robbedMoney === 0) return []

  return [
    new NewsItem({
      type: newsItemTypes.TOTAL_ROBBED_MONEY,
      weight: 0.2,
      data: { robbedMoney, daysPeriod },
    }),
  ]
}

export async function get({ robbedMoney, daysPeriod }) {
  return { robbed_money: robbedMoney, days_period: daysPeriod }
}
