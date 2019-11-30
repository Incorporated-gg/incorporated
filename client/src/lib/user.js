import asyncStorage from './asyncStorage'
import api from './api'
import { reloadApp } from '../App'

export let sessionID = null
export let userData = null

export async function userLoggedIn(newSessionID) {
  sessionID = newSessionID
  await asyncStorage.setItem('session_id', sessionID)
  userData = (await api.get('/v1/my_data')).user_data
  reloadApp()
}

export async function logout() {
  sessionID = null
  userData = null
  await asyncStorage.setItem('session_id', sessionID)
  reloadApp()
}

export async function loadUserDataFromStorage() {
  await asyncStorage.getItem('session_id', null).then(newSessionID => (sessionID = newSessionID))
  if (sessionID) {
    userData = (await api.get('/v1/my_data')).user_data
  }
}

export function updateUserData(newData) {
  if (!userData) return
  userData = Object.assign(userData, newData)
}

let lastUpdateMoneyMs
function updateMoney() {
  const deltaMs = Date.now() - lastUpdateMoneyMs
  lastUpdateMoneyMs = Date.now()
  if (!userData || Number.isNaN(deltaMs) || typeof userData.money !== 'number') return
  const incomePerSecond = userData.income_per_second
  userData.money += (incomePerSecond / 1000) * deltaMs
}
setInterval(updateMoney, 1000)
