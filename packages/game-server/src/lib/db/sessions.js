import fetch from 'node-fetch'
import mysql from '../mysql'

const initialMoney = 450000

module.exports.getUserIDFromSessionID = async sessionID => {
  if (!sessionID) return
  const accountData = await getAccount(sessionID)
  if (!accountData) return
  const [userExists] = await mysql.query('SELECT 1 FROM users WHERE id=?', [accountData.id])
  if (!userExists) {
    const initialUpdateDate = Math.floor(Date.now() / 1000)
    // First time user uses this game server. Create user row
    await mysql.query('INSERT INTO users (id, username, money, last_money_update) VALUES (?, ?, ?, ?)', [
      accountData.id,
      accountData.username,
      initialMoney,
      initialUpdateDate,
    ])
  }
  return accountData.id
}

async function getAccount(sessionID) {
  const ACCOUNT_API = process.env.NODE_ENV === 'development' ? 'http://account-server:3001' : 'http://localhost:3001'
  let headers = {}
  headers.Accept = 'application/json, text/plain, */*'
  headers.Authorization = `Basic ${sessionID}`
  const res = await fetch(`${ACCOUNT_API}/v1/my_data`, { method: 'GET', headers }).then(r => r.json())
  return res.userData
}
