import express from 'express'
import mysql from '../lib/mysql'
import * as users from '../lib/db/users'

export default (app: express.Application): void => {
  app.get('/v1/my_data', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', errorCode: 'not_logged_in' })
      return
    }

    const extraInfoPromise = mysql.query('SELECT email FROM users WHERE id=?', [req.userData.id])

    const [userData, [extraInfo]] = await Promise.all([users.getData(req.userData.id), extraInfoPromise])
    if (!userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', errorCode: 'not_logged_in' })
      return
    }

    res.json({
      userData: {
        id: userData.id,
        username: userData.username,
        email: extraInfo.email,
      },
    })
  })
}
