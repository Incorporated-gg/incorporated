export const API_URL = 'http://localhost:3100/api'
export const ACCOUNT_API_URL = 'http://localhost:3100/account_api'

import store from '../store'

export function get(url, data) {
  return apiFetch(API_URL, 'GET', url, data)
}
export function post(url, data) {
  return apiFetch(API_URL, 'POST', url, data)
}

export function accountGet(url, data) {
  return apiFetch(ACCOUNT_API_URL, 'GET', url, data)
}
export function accountPost(url, data) {
  return apiFetch(ACCOUNT_API_URL, 'POST', url, data)
}

function apiFetch(apiUrl, method, url, payload = {}) {
  let body
  let headers = {}
  headers.Accept = 'application/json, text/plain, */*'
  if (store.state.sessionId) headers['Authorization'] = `Basic ${store.state.sessionId}`
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

  return window.fetch(`${apiUrl}${url}`, { method, headers, body }).then(parseApiResponse)
}

async function parseApiResponse(res) {
  const contentType = res.headers.get('content-type')
  const jsonResponse = contentType && contentType.startsWith('application/json;') ? await res.json() : await res.text()

  if (!res.ok) return false
  return jsonResponse
}
