const mysql = require('../lib/mysql')
const { getData } = require('../lib/db/users')

module.exports = app => {
  app.get('/v1/search', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    if (typeof req.query.username !== 'string' || req.query.username.length < 3) {
      res.status(400).json({ error: 'Usa al menos 3 caracteres para la búsqueda' })
      return
    }

    let users = await mysql.query(
      'SELECT users.id FROM users JOIN ranking_income ON ranking_income.user_id = users.id WHERE users.username LIKE ? ORDER BY ranking_income.rank LIMIT 20',
      [`%${req.query.username}%`]
    )

    users = await Promise.all(users.map(u => getData(u.id)))

    res.json({
      users,
    })
  })
}
