import { useState, useEffect } from 'react'
import asyncStorage from './asyncStorage'
import { reloadApp } from '../App'
import api from 'lib/api'

export let sessionID = null
export let userData = null
export let accountData = null

export async function setNewSessionID(newSessionID) {
  sessionID = newSessionID
  await asyncStorage.setItem('session_id', sessionID)
  await Promise.all([reloadUserData(), reloadAccountData()])
  reloadApp()
}

export async function logout() {
  await asyncStorage.setItem('session_id', null)
  sessionID = null
  userData = null
  accountData = null
  reloadApp()
}

export async function loadUserAndAccountDataFromStorage() {
  sessionID = await asyncStorage.getItem('session_id', null)
  if (sessionID) {
    await Promise.all([reloadUserData(), reloadAccountData()])
  }
}

// Game user data
export async function reloadUserData() {
  const userDataFromAPI = await api.get('/v1/my_data')
  userData = Object.assign(userDataFromAPI.user_data, userDataFromAPI._extra)
  fireUserDataListeners()
}

export function updateUserData(newData) {
  if (!userData) return
  userData = Object.assign(userData, newData)
  fireUserDataListeners()
}

const userDataListeners = new Set()
export const fireUserDataListeners = () => userDataListeners.forEach(cb => cb())

export function useUserData() {
  const [, rerender] = useState({})
  useEffect(() => {
    const onChangeFn = () => rerender({})
    userDataListeners.add(onChangeFn)
    return () => userDataListeners.delete(onChangeFn)
  }, [])
  return userData
}

// Account data
export async function reloadAccountData() {
  const accountDataFromAPI = await api.accountGet('/v1/my_data')
  accountData = Object.assign(accountDataFromAPI.accountData, accountDataFromAPI._extra)
  fireAccountDataListeners()
}

const accountDataListeners = new Set()
const fireAccountDataListeners = () => accountDataListeners.forEach(cb => cb())

export function useAccountData() {
  const [, rerender] = useState({})
  useEffect(() => {
    const onChangeFn = () => rerender({})
    accountDataListeners.add(onChangeFn)
    return () => accountDataListeners.delete(onChangeFn)
  }, [])
  return accountData
}
