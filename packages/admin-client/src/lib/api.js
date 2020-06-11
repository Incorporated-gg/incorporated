export const API_URL = process.env.NODE_ENV === 'production' ? 'https://incorporated.gg/api' : 'http://localhost:3100/api'
export const ACCOUNT_API_URL = process.env.NODE_ENV === 'production' ? 'https://incorporated.gg/account_api' : 'http://localhost:3100/account_api'

import store from '../store'

export async function get(url, data) {
  return await apiFetch(API_URL, 'GET', url, data)
}
export async function post(url, data) {
  return await apiFetch(API_URL, 'POST', url, data)
}

export async function accountGet(url, data) {
  return await apiFetch(ACCOUNT_API_URL, 'GET', url, data)
}
export async function accountPost(url, data) {
  return await apiFetch(ACCOUNT_API_URL, 'POST', url, data)
}

async function apiFetch(apiUrl, method, url, payload = {}) {
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

  const response = await window.fetch(`${apiUrl}${url}`, { method, headers, body })
  return await parseApiResponse(response)
}

async function parseApiResponse(res) {
  let jsonResponse = null

  try {
    jsonResponse = await res.json()
  } catch(e) {
    jsonResponse = await res.text()
  }

  if (jsonResponse.error) alert(jsonResponse.error)
  return jsonResponse
}
