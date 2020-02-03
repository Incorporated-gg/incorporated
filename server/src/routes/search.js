const mysql = require('../lib/mysql')

module.exports = app => {
  app.get('/v1/search/:username', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    if (!req.params.username) {
      res.status(400).json({ error: 'Faltan parámetros' })
      return
    }

    const users = await mysql.query(
      'SELECT users.id, users.username, ranking.income FROM users JOIN ranking_income ON ranking_income.user_id = users.id WHERE users.username=?',
      [req.params.username]
    )

    if (!users.length) {
      res.status(404).json({
        error: 'User not found',
      })
      return
    }

    res.json({
      users,
    })
  })
}
