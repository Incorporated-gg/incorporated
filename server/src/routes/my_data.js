const users = require('../lib/db/users')
const mysql = require('../lib/mysql')

module.exports = app => {
  app.get('/v1/my_data', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userData = await users.getData(req.userData.id)
    const [[extraInfo]] = await mysql.query('SELECT email FROM users WHERE id=?', [req.userData.id])

    res.json({
      user_data: {
        id: userData.id,
        username: userData.username,
        email: extraInfo.email,
        has_alliance: Boolean(userData.alliance),
      },
    })
  })
}
