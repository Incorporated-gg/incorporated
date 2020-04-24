import mysql from '../mysql'
import { getSessionUserFromAccountService } from '../accountInternalApi'

const initialMoney = 100000

export async function getUserIDFromSessionID(sessionID) {
  if (!sessionID) return
  const sessionUser = await getSessionUserFromAccountService(sessionID)
  if (!sessionUser) return
  const [userExists] = await mysql.query('SELECT 1 FROM users WHERE id=?', [sessionUser.id])
  if (!userExists) {
    const initialUpdateDate = Math.floor(Date.now() / 1000)
    // First time user uses this game server. Create user row
    await mysql.query('INSERT INTO users (id, username, money, last_money_update) VALUES (?, ?, ?, ?)', [
      sessionUser.id,
      sessionUser.username,
      initialMoney,
      initialUpdateDate,
    ])
  }
  return sessionUser.id
}
