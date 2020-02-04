import express from 'express'
import * as users from '../../lib/db/users'
import { getUserIDFromSessionID } from '../../lib/db/sessions'
import { validateSecret } from '.'

export default (app: express.Application): void => {
  app.get('/v1/game_internal/validate_session', async function(req, res) {
    if (!req.query.secret || !validateSecret(req.query.secret)) {
      res.status(401).json({ error: 'Invalid secret' })
      return
    }

    const userID = await getUserIDFromSessionID(req.query.sessionID)
    const accountData = await users.getData(userID)
    if (!accountData) {
      res.status(401).json({ error: 'Invalid sessionID' })
      return
    }

    const sessionUser = {
      id: userID,
      username: accountData.username,
    }
    res.json({
      sessionUser,
    })
  })
}
