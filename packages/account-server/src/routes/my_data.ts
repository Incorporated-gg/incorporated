import express from 'express'
import * as users from '../lib/db/users'

export default (app: express.Application): void => {
  app.get('/v1/my_data', async function(req, res) {
    if (!req.accountData) {
      res.status(401).json({ error: 'Necesitas estar conectado', errorCode: 'not_logged_in' })
      return
    }

    const accountData = await users.getData(req.accountData.id)
    if (!accountData) {
      res.status(401).json({ error: 'Necesitas estar conectado', errorCode: 'not_logged_in' })
      return
    }

    res.json({
      accountData,
    })
  })
}
