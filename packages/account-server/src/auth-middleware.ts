import express from 'express'
import mysql from './lib/mysql'

interface AccountData {
  id: number
  username: string
  admin: boolean
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      accountData: AccountData | null
    }
  }
}

async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  req.accountData = null

  if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
    const sessionID = req.headers.authorization.replace('Basic ', '')
    const [sessionData] = await mysql.query('SELECT user_id FROM sessions WHERE id=?', [sessionID])
    if (sessionData) {
      ;[req.accountData] = await mysql.query('SELECT id, username, admin FROM users WHERE id=?', [sessionData.user_id])
    }
    if (!req.accountData) {
      res.status(400).json({ error: 'Sesión caducada', errorCode: 'invalid_session_id' })
      return
    }
  }

  next()
}

export default (app: express.Application): void => {
  app.use(authMiddleware)
}
