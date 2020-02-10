import express from 'express'
import * as users from '../../lib/db/users'
import { validateGameServerRequest } from '.'

export default (app: express.Application): void => {
  app.get('/v1/game_internal/get_user_data', async function(req, res) {
    if (!validateGameServerRequest(req)) {
      res.status(401).json({ error: 'Invalid secret' })
      return
    }

    const accountData = await users.getData(req.query.userID)
    if (!accountData) {
      res.status(401).json({ error: 'Invalid sessionID' })
      return
    }

    res.json({
      accountData,
    })
  })
}
