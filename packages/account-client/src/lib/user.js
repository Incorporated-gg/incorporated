import { useState, useEffect } from 'react'
import asyncStorage from './asyncStorage'
import api from './api'
import { reloadApp } from '../App'

export let sessionID = null
export let accountData = null

export async function userLoggedIn(newSessionID) {
  sessionID = newSessionID
  await asyncStorage.setItem('session_id', sessionID)
  await reloadAccountData()
  reloadApp()
}

export async function reloadAccountData() {
  const accountDataFromAPI = await api.get('/v1/my_data')
  accountData = Object.assign(accountDataFromAPI.accountData, accountDataFromAPI._extra)
  fireaccountDataListeners()
}

export async function logout() {
  await asyncStorage.setItem('session_id', null)
  sessionID = null
  accountData = null
  reloadApp()
}

export async function loadAcountDataFromStorage() {
  sessionID = await asyncStorage.getItem('session_id', null)
  if (sessionID) await reloadAccountData()
}

export function updateAccountData(newData) {
  if (!accountData) return
  accountData = Object.assign(accountData, newData)
  fireaccountDataListeners()
}

const accountDataListeners = new Set()
export const fireaccountDataListeners = () => accountDataListeners.forEach(cb => cb())

export function useAccountData() {
  const [, rerender] = useState({})
  useEffect(() => {
    const onChangeFn = () => rerender({})
    accountDataListeners.add(onChangeFn)
    return () => accountDataListeners.delete(onChangeFn)
  }, [])
  return accountData
}
