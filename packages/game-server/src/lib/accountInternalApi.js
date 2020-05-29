import fetch from 'node-fetch'
import cache from './cache'

export async function getAccountData(userID) {
  // TODO: If account changes username, should we detect it here or change it from a API call from the account service?

  const key = `accountUserData:${userID}`
  const cachedData = cache.get(key)
  if (cachedData !== undefined) return cachedData

  const query = { userID }
  const res = await accountInternalApiFetch('GET', '/get_user_data', query)
  const result = res.accountData || null

  cache.set(key, result, 1)
  return result
}

export async function getSessionUserFromAccountService(sessionID) {
  const key = `sessionUserFromAccountService:${sessionID}`
  const cachedData = cache.get(key)
  if (cachedData !== undefined) return cachedData

  const query = { sessionID }
  const res = await accountInternalApiFetch('GET', '/validate_session', query)
  const result = res.sessionUser || false

  cache.set(key, result, 600)
  return result
}

export async function sendAccountHook(eventID, eventData) {
  const params = { eventID, eventData }
  await accountInternalApiFetch('POST', '/game_event_hook', params)
}

function accountInternalApiFetch(method, url, payload = {}) {
  const ACCOUNT_API_BASE =
    process.env.NODE_ENV === 'development'
      ? 'http://account-server:3001/v1/game_internal'
      : 'http://localhost:3001/v1/game_internal'
  let body
  let headers = {}
  headers.Accept = 'application/json, text/plain, */*'
  headers.Authorization = `Bearer ${process.env.ACCOUNT_CLIENT_SHARED_SECRET}`

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

  return fetch(`${ACCOUNT_API_BASE}${url}`, { method, headers, body })
    .then(r => r.json())
    .catch(err => {
      err.message = '[accountInternalApi] ' + err.message
      throw err
    })
}
