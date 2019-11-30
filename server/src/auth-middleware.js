const mysql = require('./lib/mysql')

module.exports = app => {
  app.use(async (req, res, next) => {
    req.userData = null

    if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
      const sessionID = req.headers.authorization.replace('Basic ', '')
      const [[sessionData]] = await mysql.query('SELECT user_id FROM sessions WHERE id=?', [sessionID])
      if (sessionData) {
        ;[[req.userData]] = await mysql.query('SELECT id, username, email FROM users WHERE id=?', [sessionData.user_id])
      }
      if (!req.userData) {
        res.status(400).send({ error: 'Sesión caducada', error_code: 'invalid_session_id' })
        return
      }
    }

    next()
  })
}
