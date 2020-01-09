import React, { useEffect, useState } from 'react'
import styles from './Buildings.module.scss'
import BuildingItem from './BuildingItem'
import OptimizeResearch from './OptimizeResearch'
import { buildingsList, calcBuildingDailyIncome, calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { useUserData, userData as userDataRaw, fireUserDataListeners } from '../../lib/user'
import { getIncomeTaxes } from 'shared-lib/taxes'
import CardList, { cardListStyles } from '../../components/CardList'

export default function Buildings() {
  const userData = useUserData()
  const [activeScreen, setActiveScreen] = useState('bank')

  // Calculate taxes percent
  const buildingsIncome = buildingsList.map(buildingInfo => {
    const quantity = userData.buildings[buildingInfo.id].quantity
    const income = calcBuildingDailyIncome(buildingInfo.id, quantity, userData.researchs[5])
    return { building_id: buildingInfo.id, name: buildingInfo.name, quantity, income }
  })
  const totalBuildingsIncome = buildingsIncome.reduce((prev, curr) => prev + curr.income, 0)
  const taxesPercent = getIncomeTaxes(totalBuildingsIncome, userData.alliance)

  useEffect(() => {
    const interval = setupBuildingsBankUpdater(taxesPercent)
    return () => clearInterval(interval)
  }, [taxesPercent])

  const switchBuyAndBank = () => {
    setActiveScreen(activeScreen === 'bank' ? 'buy' : 'bank')
  }

  return (
    <CardList noGrid>
      <button className={styles.switchBuyAndBank} onClick={switchBuyAndBank}>
        CAMBIAR A {activeScreen === 'bank' ? 'COMPRAR' : 'BANCO'}
      </button>
      <br />
      <div className={cardListStyles.grid}>
        <OptimizeResearch activeScreen={activeScreen} />
        {buildingsList.map(buildingInfo => (
          <BuildingItem
            key={buildingInfo.id}
            buildingID={buildingInfo.id}
            taxesPercent={taxesPercent}
            activeScreen={activeScreen}
          />
        ))}
      </div>
    </CardList>
  )
}

function setupBuildingsBankUpdater(taxesPercent) {
  // Update every second userData.building money properties while the buildings screen is active

  function updateBuildingsMoney() {
    const userData = userDataRaw
    const deltaMs = Date.now() - userData.__buildings_last_buildings_money_update
    userData.__buildings_last_buildings_money_update = Date.now()
    if (Number.isNaN(deltaMs)) {
      // First time since API call, ignore this time
      return null
    }

    Object.entries(userData.buildings).forEach(([buildingID, building]) => {
      buildingID = parseInt(buildingID)
      const dailyIncome = calcBuildingDailyIncome(buildingID, building.quantity, userData.researchs[5])
      const intervalRevenue = (deltaMs / 1000) * (dailyIncome / 24 / 60 / 60) * (1 - taxesPercent)
      const maxMoney = calcBuildingMaxMoney({
        buildingID,
        buildingAmount: building.quantity,
        bankResearchLevel: userData.researchs[4],
      })
      building.money += intervalRevenue
      if (building.money > maxMoney.maxTotal) building.money = maxMoney.maxTotal
    })

    fireUserDataListeners()
  }
  setTimeout(updateBuildingsMoney, 0)
  return setInterval(updateBuildingsMoney, 1000)
}
