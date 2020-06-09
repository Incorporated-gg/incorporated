import mysql from '../lib/mysql'
import { generateSession } from '../lib/db/sessions'
import bcrypt from 'bcryptjs'
import express from 'express'

export default (app: express.Application): void => {
  app.post('/v1/login', async function(req, res) {
    if (!req.body.password || !req.body.username) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const username = req.body.username
    const password = req.body.password
    const adminLogin = req.body.admin ? 1 : 0

    const [user] = await mysql.query('SELECT id, password FROM users WHERE username=? AND admin=?', [
      username,
      adminLogin,
    ])
    if (!user) {
      res.status(400).json({ error: 'Datos inválidos', success: false })
      return
    }
    const encryptedPass = user.password
    if (!(await bcrypt.compare(password, encryptedPass))) {
      res.status(400).json({ error: 'Datos inválidos', success: false })
      return
    }

    const sessionID = await generateSession(user.id)
    res.json({ sessionID: sessionID, success: true })
  })
}
