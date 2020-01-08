import React from 'react'
import { calcBuildingPrice, calcBuildingDailyIncome, buildingsList } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import { useUserData, updateUserData } from '../../lib/user'
import api from '../../lib/api'
import Card from './Card'

const buildingImages = {
  1: require('./img/b1.png'),
  2: require('./img/b2.png'),
  3: require('./img/b3.png'),
  4: require('./img/b4.png'),
  5: require('./img/b5.png'),
  6: require('./img/b6.png'),
}
const buildingDescriptions = {
  1: `Aún existen de estas?`,
  2: `Todo el mundo necesita comer.`,
  3: `No vendemos drogas.`,
  4: `A los guiris les cobramos doble.`,
  5: `Compra palomitas!`,
  6: `A veces limpiamos las habitaciones!`,
}
const buildingAccentColors = {
  1: '#EE5487',
  2: '#481c82',
  3: '#82BB30',
  4: '#378cd8',
  5: '#d0ac29',
  6: '#A13647',
}

BuildingItem.propTypes = {
  buildingID: PropTypes.number.isRequired,
  taxesPercent: PropTypes.number.isRequired,
}
export default function BuildingItem({ buildingID, taxesPercent }) {
  const userData = useUserData()
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  const buildingCount = userData.buildings[buildingID].quantity
  const coste = calcBuildingPrice(buildingID, buildingCount)
  const income = calcBuildingDailyIncome(buildingID, 1, userData.researchs[5]) * (1 - taxesPercent)
  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString()

  const currentOptimizeLvl = userData.researchs[5]
  const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel
  const canAfford = userData.money > coste
  const canBuy = hasEnoughOptimizeLvl && canAfford

  const buyBuilding = async () => {
    if (!canBuy) return
    try {
      updateUserData({
        ...userData,
        buildings: {
          ...userData.buildings,
          [buildingID]: { ...userData.buildings[buildingID], quantity: buildingCount + 1 },
        },
      })
      await api.post('/v1/buildings/buy', { building_id: buildingID, count: 1 })
    } catch (e) {
      alert(e.message)
    }
  }

  let desc = buildingDescriptions[buildingID]
  if (!hasEnoughOptimizeLvl)
    desc = `${desc}\nNecesitas oficina central nivel ${buildingInfo.requiredOptimizeResearchLevel}.`

  const onExtractMoney = async () => {
    try {
      const extractedMoney = userData.buildings[buildingID].money
      updateUserData({
        ...userData,
        money: userData.money + extractedMoney,
        buildings: {
          ...userData.buildings,
          [buildingID]: { ...userData.buildings[buildingID], money: 0 },
        },
      })
      await api.post('/v1/buildings/extract_money', { building_id: buildingID })
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <Card
      image={buildingImages[buildingID]}
      buildingID={buildingInfo.id}
      title={buildingInfo.name}
      buildingCount={buildingCount}
      desc={desc}
      coste={coste.toLocaleString()}
      pri={timeToRecoverInvestment}
      dailyIncome={income}
      canBuy={canBuy}
      onBuy={buyBuilding}
      accentColor={buildingAccentColors[buildingID]}
      accumulatedMoney={userData.buildings[buildingID].money}
      onExtractMoney={onExtractMoney}
    />
  )
}
