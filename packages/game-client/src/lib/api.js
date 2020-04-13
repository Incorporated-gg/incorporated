import { updateUserData, sessionID, logout } from './user'
import { updateTabTitle } from './tabTitle'

const API_URL = '/api'
const ACCOUNT_API_URL = '/account_api'

function get(url, data) {
  return apiFetch(API_URL, 'GET', url, data)
}
function post(url, data) {
  return apiFetch(API_URL, 'POST', url, data)
}

function accountGet(url, data) {
  return apiFetch(ACCOUNT_API_URL, 'GET', url, data)
}
function accountPost(url, data) {
  return apiFetch(ACCOUNT_API_URL, 'POST', url, data)
}

export default {
  get,
  post,
  accountPost,
  accountGet,
  API_URL,
}

let lastApiCallID = null
function apiFetch(apiUrl, method, url, payload = {}) {
  let body
  let headers = {}
  headers.Accept = 'application/json, text/plain, */*'
  if (sessionID) headers['Authorization'] = `Basic ${sessionID}`
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

  const apiCallID = Math.random()
  lastApiCallID = apiCallID
  return window.fetch(`${apiUrl}${url}`, { method, headers, body }).then(res => parseApiResponse(apiCallID, res))
}

async function parseApiResponse(apiCallID, res) {
  const contentType = res.headers.get('content-type')
  const jsonResponse = contentType && contentType.startsWith('application/json;') ? await res.json() : await res.text()

  if (jsonResponse.error_code === 'invalid_session_id') {
    logout()
  }
  if (apiCallID === lastApiCallID && jsonResponse._extra) {
    updateTabTitle({ unreadMessages: jsonResponse._extra.unread_messages_count })
    updateUserData({
      ...jsonResponse._extra,
      // Needed for the internal implementation of Buildings's bank auto update.
      // See src/routes/Buildings/Buildings.js -> setupBuildingsBankUpdater()
      __buildings_last_buildings_money_update: undefined,
    })
  }

  if (!res.ok) throw new Error(jsonResponse.error || JSON.stringify(jsonResponse))
  return jsonResponse
}
