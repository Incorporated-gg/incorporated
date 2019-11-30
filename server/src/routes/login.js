const mysql = require('../lib/mysql')
const sessions = require('../lib/db/sessions')
const bcrypt = require('bcryptjs')

module.exports = app => {
  app.post('/v1/login', async function(req, res) {
    if (!req.body.password || !req.body.username) {
      res.status(400).send({ error: 'Faltan datos' })
      return
    }

    const username = req.body.username
    const password = req.body.password

    const [[user]] = await mysql.query('SELECT id, password FROM users WHERE username=? LIMIT 1', [username])
    if (!user) {
      res.send({ success: false })
      return
    }
    const encryptedPass = user.password
    if (!(await bcrypt.compare(password, encryptedPass))) {
      res.send({ success: false })
      return
    }

    const sessionID = await sessions.generateSession(user.id)
    res.send({ session_id: sessionID, success: true })
  })
}
