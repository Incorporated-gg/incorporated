import mysql from '../mysql'

const sessionValidChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('')
async function generateSessionID(): Promise<string> {
  const randomSessionID = new Array(100)
    .fill(null)
    .map(() => sessionValidChars[Math.floor(Math.random() * sessionValidChars.length)])
    .join('')

  // Check that generated id doesn't exist, should be basically impossible
  const [session] = await mysql.query('SELECT 1 FROM sessions WHERE id=?', [randomSessionID])
  if (session) return await generateSessionID() // If it does, generate another

  return randomSessionID
}

export const generateSession = async (userID: number): Promise<string> => {
  const sessionID = await generateSessionID()
  const tsNow = Math.floor(Date.now() / 1000)
  await mysql.query('INSERT INTO sessions (id, user_id, created_at, last_used_at) VALUES (?, ?, ?, ?)', [
    sessionID,
    userID,
    tsNow,
    tsNow,
  ])
  return sessionID
}

export const getUserIDFromSessionID = async (sessionID: number): Promise<number | undefined> => {
  if (!sessionID) return
  const [session] = await mysql.query('SELECT user_id FROM sessions WHERE id=?', [sessionID])
  if (!session) return
  return session.user_id
}
