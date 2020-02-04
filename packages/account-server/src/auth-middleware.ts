import express from 'express'
import mysql from './lib/mysql'

type accountData = {
  id: number
  username: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      accountData: accountData | null
    }
  }
}

async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  req.accountData = null

  if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
    const sessionID = req.headers.authorization.replace('Basic ', '')
    const [sessionData] = await mysql.query('SELECT user_id FROM sessions WHERE id=?', [sessionID])
    if (sessionData) {
      ;[req.accountData] = await mysql.query('SELECT id, username FROM users WHERE id=?', [sessionData.user_id])
    }
    if (!req.accountData) {
      res.status(400).json({ error: 'Sesión caducada', errorCode: 'invalid_session_id' })
      return
    }
  }

  next()
}

function modifyResponseBody(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const oldJson = res.json

  // eslint-disable-next-line
  // @ts-ignore I can't figure out how to fix this
  res.json = async function(...args): Promise<void> {
    if (req.accountData) {
      // Modify response to include extra data for logged in users
      const extraData = {}
      args[0]._extra = extraData
    }
    oldJson.apply(res, args)
  }
  next()
}

export default (app: express.Application): void => {
  app.use(authMiddleware)
  app.use(modifyResponseBody)
}
