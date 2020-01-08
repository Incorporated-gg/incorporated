import { useState, useEffect } from 'react'
import asyncStorage from './asyncStorage'
import api from './api'
import { reloadApp } from '../App'

export let sessionID = null
export let userData = null

async function refreshUserDataFromAPI() {
  const userDataFromAPI = await api.get('/v1/my_data')
  userData = Object.assign(userDataFromAPI.user_data, userDataFromAPI._extra)
}

export async function userLoggedIn(newSessionID) {
  sessionID = newSessionID
  await asyncStorage.setItem('session_id', sessionID)
  await refreshUserDataFromAPI()
  fireUserDataListeners()
  reloadApp()
}

export async function reloadUserData() {
  await refreshUserDataFromAPI()
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
    await refreshUserDataFromAPI()
    fireUserDataListeners()
  }
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
