const mysql = require('../lib/mysql')
const users = require('../lib/db/users')

module.exports = app => {
  app.get('/v1/ranking', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [rankingData] = await mysql.query('SELECT user_id FROM ranking ORDER BY ranking.rank ASC')
    const ranking = await Promise.all(rankingData.map(rankUser => users.getData(rankUser.user_id)))

    res.json({
      ranking,
    })
  })
}
