const mysql = require('../lib/mysql')

module.exports = app => {
  app.get('/v1/ranking', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const ranking = []
    const [rankingData] = await mysql.query(
      'SELECT ranking.id, ranking.user_id, ranking.income, users.username FROM ranking JOIN users ON ranking.user_id = users.id ORDER BY ranking.income DESC'
    )
    if (rankingData.length) rankingData.forEach(rankUser => 
      ranking.push({
        id: rankUser.id,
        username: rankUser.username,
        income: rankUser.income,
      })
    )

    res.json({
      ranking,
    })
  })
}
