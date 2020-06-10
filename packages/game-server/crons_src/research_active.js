import mysql from '../src/lib/mysql'
import { upgradeUserResearch } from '../src/lib/db/researchs'
import { logUserActivity } from '../src/lib/accountInternalApi'
export const frequencyMs = 10 * 1000

export async function run() {
  const tsNow = Math.floor(Date.now() / 1000)
  const researchs = await mysql.query(
    'SELECT user_id, research_id, finishes_at FROM research_active WHERE finishes_at<=?',
    [tsNow]
  )
  await Promise.all(
    researchs.map(async research => {
      await mysql.query('DELETE FROM research_active WHERE user_id=? AND research_id=?', [
        research.user_id,
        research.research_id,
      ])
      await upgradeUserResearch(research.user_id, research.research_id)

      logUserActivity({
        userId: research.user_id,
        date: Date.now(),
        ip: 'internal',
        message: '',
        type: 'researchEnd',
        extra: {
          researchID: research.research_id,
          finishesAt: research.finishes_at,
        },
      })
    })
  )
}
