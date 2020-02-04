import mysql from '../mysql'
import { validateSessionID } from '../accountInternalApi'

const initialMoney = 450000

module.exports.getUserIDFromSessionID = async sessionID => {
  if (!sessionID) return
  const sessionUser = await validateSessionID(sessionID)
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
