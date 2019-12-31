const mysql = require('../lib/mysql')
const sessions = require('../lib/db/sessions')
const bcrypt = require('bcryptjs')

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const alphanumericRegexp = /^[a-z0-9]+$/i
const initialMoney = 450000

module.exports = app => {
  app.post('/v1/register', async function(req, res) {
    if (!req.body.password || !req.body.username || !req.body.email) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const username = req.body.username
    const saltRounds = 10
    const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
    const email = req.body.email
    const initialUpdateDate = Math.floor(Date.now() / 1000)

    const isValidEmail = typeof email === 'string' && emailRegexp.test(email)
    if (!isValidEmail) {
      res.status(400).json({ error: 'Email inválido' })
      return
    }

    const isValidUsername =
      typeof username === 'string' && username.length >= 4 && username.length <= 20 && alphanumericRegexp.test(username)
    if (!isValidUsername) {
      res.status(400).json({ error: 'Username inválido' })
      return
    }

    let insertId
    try {
      ;[
        { insertId },
      ] = await mysql.query(
        'INSERT INTO users (username, password, email, money, last_money_update) VALUES (?, ?, ?, ?, ?)',
        [username, encryptedPassword, email, initialMoney, initialUpdateDate]
      )
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Este usuario o email ya existen' })
        return
      }
      throw e
    }

    const sessionID = await sessions.generateSession(insertId)

    res.json({ new_user_id: insertId, session_id: sessionID, success: true })
  })
}
