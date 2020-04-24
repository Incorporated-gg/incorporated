import { getActiveResearchs } from '../lib/db/researchs'
import mysql from '../lib/mysql'
import { getUserAllianceRank } from '../lib/db/alliances'
import { getUserData } from '../lib/db/users'

module.exports = app => {
  app.get('/v1/my_data', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [userData, userRank, activeResearchs] = await Promise.all([
      getUserData(req.userData.id),
      getUserAllianceRank(req.userData.id),
      getActiveResearchs(req.userData.id),
    ])

    res.json({
      user_data: {
        id: userData.id,
        username: userData.username,
        alliance: userData.alliance,
        alliance_user_rank: userRank,
        activeResearchs,
      },
    })
  })

  app.get('/v1/my_data/daily_log', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const dailyLogInfo = await mysql.query('SELECT server_day, daily_income FROM users_daily_log WHERE user_id=?', [
      req.userData.id,
    ])

    res.json({
      daily_log: dailyLogInfo,
    })
  })
}
