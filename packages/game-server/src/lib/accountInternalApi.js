import fetch from 'node-fetch'
import cache from './cache'

export async function getAccountUserData(userID) {
  // TODO: If account changes username, should we detect it here or change it from a API call from the account service?

  const key = `getAccountUserData:${userID}`
  const cachedData = cache.get(key)
  if (cachedData !== undefined) return cachedData

  const query = { userID }
  const res = await accountInternalApiFetch('GET', '/get_user_data', query)
  const result = res.accountData || null
  if (result) {
    delete result.id
    delete result.username
  }

  cache.set(key, result)
  return result
}

export async function validateSessionID(sessionID) {
  const key = `validateSessionID:${sessionID}`
  const cachedData = cache.get(key)
  if (cachedData !== undefined) return cachedData

  const query = { sessionID }
  const res = await accountInternalApiFetch('GET', '/validate_session', query)
  const result = res.sessionUser || null

  cache.set(key, result)
  return result
}

function accountInternalApiFetch(method, url, payload = {}) {
  const ACCOUNT_API_BASE =
    process.env.NODE_ENV === 'development'
      ? 'http://account-server:3001/v1/game_internal'
      : 'http://localhost:3001/v1/game_internal'
  let body
  let headers = {}
  headers.Accept = 'application/json, text/plain, */*'

  payload.secret = 'c342[E$32C'
  if (method === 'POST') {
    body = JSON.stringify(payload)
    headers['Content-Type'] = 'application/json'
  }
  if (method === 'GET') {
    url =
      url +
      '?' +
      Object.entries(payload)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join('&')
  }

  return fetch(`${ACCOUNT_API_BASE}${url}`, { method, headers, body }).then(r => r.json())
}
