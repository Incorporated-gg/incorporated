import { useState, useEffect } from 'react'
import asyncStorage from './asyncStorage'
import { reloadApp } from '../App'
import api from 'lib/api'
import { setServerTimeOffsets } from './serverTime'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import { calcBuildingDailyIncome, calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'

export let sessionID = null
export let userData = null

export async function setNewSessionID(newSessionID) {
  sessionID = newSessionID
  await asyncStorage.setItem('session_id', sessionID)
  await reloadUserData()
  reloadApp()
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
    await reloadUserData()
  }
}

// Game user data
export async function reloadUserData() {
  const userDataFromAPI = await api.get('/v1/my_data')
  setServerTimeOffsets(userDataFromAPI.server_data)
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

function setupPersonnelSalaryMoneyUpdater() {
  function update() {
    const deltaMs = Date.now() - userData.__last_money_update
    userData.__last_money_update = Date.now()
    if (Number.isNaN(deltaMs)) {
      // First time since API call, ignore this time
      return null
    }

    // Update money from personnel maintenance
    let totalDailyCost = 0
    Object.entries(userData.personnel).forEach(([troopID, amount]) => {
      const troopsInfo = PERSONNEL_OBJ[troopID]
      totalDailyCost += troopsInfo.dailyMaintenanceCost * amount
    })
    if (totalDailyCost === 0) return // no troops
    const intervalCost = (deltaMs / 1000) * (totalDailyCost / 24 / 60 / 60)
    userData.money -= intervalCost

    // Update buildings accumulated money
    Object.entries(userData.buildings).forEach(([buildingID, building]) => {
      buildingID = parseInt(buildingID)
      const dailyIncome = calcBuildingDailyIncome(buildingID, building.quantity, userData.researchs[5])
      const intervalRevenue = (deltaMs / 1000) * (dailyIncome / 24 / 60 / 60)
      const maxMoney = calcBuildingMaxMoney({
        buildingID,
        buildingAmount: building.quantity,
        bankResearchLevel: userData.researchs[4],
      })
      if (building.money > maxMoney.maxTotal) return
      building.money += intervalRevenue
      if (building.money > maxMoney.maxTotal) building.money = maxMoney.maxTotal
    })

    fireUserDataListeners()
  }
  function tick() {
    if (userData) update()
    setTimeout(tick, 3000)
  }
  tick()
}
setupPersonnelSalaryMoneyUpdater()
