const mysql = require('../mysql')
module.exports.generateSession = async userID => {
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

const sessionValidChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('')
async function generateSessionID() {
  const randomSessionID = new Array(100)
    .fill(null)
    .map(() => sessionValidChars[Math.floor(Math.random() * sessionValidChars.length)])
    .join('')

  // Check that generated id doesn't exist, should be basically impossible
  const [[session]] = await mysql.query('SELECT 1 FROM sessions WHERE id=?', [randomSessionID])
  if (session) return await generateSessionID() // If it does, generate another

  return randomSessionID
}

module.exports.getUserIDFromSessionID = async sessionID => {
  if (!sessionID) return
  const [[{ user_id: userID }]] = await mysql.query('SELECT user_id FROM sessions WHERE id=?', [sessionID])
  return userID
}
