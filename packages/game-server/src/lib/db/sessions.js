import mysql from '../mysql'
import { getSessionUserFromAccountService } from '../accountInternalApi'

const INITIAL_MONEY = 100000
const INITIAL_ATTACKS_LEFT = 3

export async function getUserIDFromSessionID(sessionID) {
  if (!sessionID) return
  const sessionUser = await getSessionUserFromAccountService(sessionID)
  if (!sessionUser) return
  const [userExists] = await mysql.query('SELECT 1 FROM users WHERE id=?', [sessionUser.id])
  if (!userExists) {
    const initialUpdateDate = Math.floor(Date.now() / 1000)
    // First time user uses this game server. Create user row
    await mysql.query(
      'INSERT INTO users (id, username, money, last_money_update, attacks_left) VALUES (?, ?, ?, ?, ?)',
      [sessionUser.id, sessionUser.username, INITIAL_MONEY, initialUpdateDate, INITIAL_ATTACKS_LEFT]
    )
  }
  return sessionUser.id
}
