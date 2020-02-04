import { updateAccountData, sessionID, logout } from './user'

export const API_URL = '/api'

export default { get, post, API_URL }

export function post(url, data) {
  return apiFetch('POST', url, data)
}
export function get(url, data) {
  return apiFetch('GET', url, data)
}

let lastApiCallID = null
function apiFetch(method, url, payload = {}) {
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

  lastApiCallID = Math.random()
  return window.fetch(`${API_URL}${url}`, { method, headers, body }).then(res => parseApiResponse(lastApiCallID, res))
}

async function parseApiResponse(apiCallID, res) {
  const contentType = res.headers.get('content-type')
  const jsonResponse = contentType.startsWith('application/json;') ? await res.json() : await res.text()

  if (jsonResponse.error_code === 'invalid_session_id') {
    logout()
  }
  if (apiCallID === lastApiCallID && jsonResponse._extra) {
    updateAccountData({
      ...jsonResponse._extra,
      // Needed for the internal implementation of Buildings's bank auto update.
      // See src/routes/Buildings/Buildings.js -> setupBuildingsBankUpdater()
      __buildings_last_buildings_money_update: undefined,
    })
  }

  if (!res.ok) throw new Error(jsonResponse.error || JSON.stringify(jsonResponse))
  return jsonResponse
}
