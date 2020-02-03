const mysql = require('../lib/mysql')
const users = require('../lib/db/users')

module.exports = app => {
  app.get('/v1/contests', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const contests = await mysql.query(
      'SELECT id, name FROM contests WHERE started_at IS NOT NULL AND ended_at IS NULL'
    )

    res.json({
      contests,
    })
  })

  app.get('/v1/contests/:contestName', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [
      contest,
    ] = await mysql.query(
      'SELECT id, name FROM contests WHERE name = ? AND started_at IS NOT NULL AND ended_at IS NULL',
      [req.params.contestName]
    )

    if (!contest) {
      res.status(404).json({ error: 'No se ha encontrado el concurso' })
      return
    }

    const scoreboards = await mysql.query(
      'SELECT user_id, score, rank FROM contests_scoreboards WHERE contest_id = ? ORDER BY rank ASC',
      [contest.id]
    )
    const contestInfo = await Promise.all(
      scoreboards.map(async score => {
        return {
          score: score.score,
          rank: score.rank,
          user: await users.getData(score.user_id),
        }
      })
    )

    res.json({
      contestInfo,
    })
  })
}
