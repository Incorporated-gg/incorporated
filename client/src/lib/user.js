import { useState, useEffect } from 'react'
import asyncStorage from './asyncStorage'
import api from './api'
import { reloadApp } from '../App'
import { calcUserMaxMoney } from 'shared-lib/researchUtils'

export let sessionID = null
export let userData = null

export async function userLoggedIn(newSessionID) {
  sessionID = newSessionID
  await asyncStorage.setItem('session_id', sessionID)
  userData = (await api.get('/v1/my_data')).user_data
  fireUserDataListeners()
  reloadApp()
}

export async function reloadUserData() {
  userData = (await api.get('/v1/my_data')).user_data
  fireUserDataListeners()
}

export async function logout() {
  await asyncStorage.setItem('session_id', null)
  sessionID = null
  userData = null
  reloadApp()
}

export async function loadUserDataFromStorage() {
  sessionID = await asyncStorage.getItem('session_id', null)
  if (sessionID) {
    userData = (await api.get('/v1/my_data')).user_data
    fireUserDataListeners()
  }
}

export function updateUserData(newData) {
  if (!userData) return
  userData = Object.assign(userData, newData)
  fireUserDataListeners()
}

let lastUpdateMoneyMs
function updateMoney() {
  const deltaMs = Date.now() - lastUpdateMoneyMs
  lastUpdateMoneyMs = Date.now()
  if (!userData || Number.isNaN(deltaMs) || typeof userData.money !== 'number') return
  const incomePerSecond = userData.income_per_second
  userData.money += (incomePerSecond / 1000) * deltaMs
  const maxMoney = calcUserMaxMoney(userData.researchs)
  if (userData.money > maxMoney) userData.money = maxMoney
  fireUserDataListeners()
}
setInterval(updateMoney, 1000)

const userDataListeners = new Set()
const fireUserDataListeners = () => userDataListeners.forEach(cb => cb())

export function useUserData() {
  const [, rerender] = useState({})
  useEffect(() => {
    const onChangeFn = () => rerender({})
    userDataListeners.add(onChangeFn)
    return () => userDataListeners.delete(onChangeFn)
  }, [])
  return userData
}
