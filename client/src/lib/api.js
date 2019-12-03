import { updateUserData, sessionID, logout } from './user'

const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '/api/'

export default { get, post }

export function post(url, data) {
  return apiFetch('POST', url, data)
}
export function get(url, data) {
  return apiFetch('GET', url, data)
}

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
        .map(([key, val]) => `${key}=${val}`)
        .join('&')
  }
  return window.fetch(`${API_URL}${url}`, { method, headers, body }).then(parseApiResponse)
}

async function parseApiResponse(res) {
  const contentType = res.headers.get('content-type')
  const jsonResponse = contentType.startsWith('application/json;') ? await res.json() : await res.text()

  if (jsonResponse.error_code === 'invalid_session_id') {
    logout()
  }
  if (jsonResponse._extra) {
    updateUserData(jsonResponse._extra)
  }

  if (!res.ok) throw new Error(jsonResponse.error || JSON.stringify(jsonResponse))
  return jsonResponse
}
