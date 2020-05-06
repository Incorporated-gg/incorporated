import mysql from '../lib/mysql'
import { generateSession } from '../lib/db/sessions'
import bcrypt from 'bcryptjs'
import express from 'express'

const ACCOUNT_NAMING_REQUIREMENTS = {
  minLength: 4,
  maxLength: 16,
  regExp: /^[a-z0-9_-]+$/i,
}
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export default (app: express.Application): void => {
  app.post('/v1/register', async function(req, res) {
    if (!req.body.password || !req.body.username || !req.body.email) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const username = req.body.username
    const saltRounds = 10
    const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
    const email = req.body.email
    const tsNow = Math.floor(Date.now() / 1000)

    const isValidEmail = typeof email === 'string' && emailRegexp.test(email)
    if (!isValidEmail) {
      res.status(400).json({ error: 'Email inválido' })
      return
    }

    const isValidUsername =
      typeof username === 'string' &&
      username.length >= ACCOUNT_NAMING_REQUIREMENTS.minLength &&
      username.length <= ACCOUNT_NAMING_REQUIREMENTS.maxLength &&
      ACCOUNT_NAMING_REQUIREMENTS.regExp.test(username)
    if (!isValidUsername) {
      res.status(400).json({ error: 'Username inválido' })
      return
    }

    let userID
    try {
      const {
        insertId,
      } = await mysql.query('INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, ?)', [
        username,
        encryptedPassword,
        email,
        tsNow,
      ])
      userID = insertId
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Este usuario o email ya existen' })
        return
      }
      throw e
    }

    const sessionID = await generateSession(userID)

    res.json({ newUserID: userID, sessionID: sessionID, success: true })
  })
}
