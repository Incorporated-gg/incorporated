import mysql from '../lib/mysql'
import { upgradeUserResearch } from '../lib/db/researchs'
export const frequencyMs = 10 * 1000

export async function run() {
  const tsNow = Math.floor(Date.now() / 1000)
  const researchs = await mysql.query('SELECT user_id, research_id FROM research_active WHERE finishes_at<=?', [tsNow])
  await Promise.all(
    researchs.map(async research => {
      await mysql.query('DELETE FROM research_active WHERE user_id=? AND research_id=?', [
        research.user_id,
        research.research_id,
      ])
      await upgradeUserResearch(research.user_id, research.research_id)
    })
  )
}
