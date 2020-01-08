import React from 'react'
import {
  calcBuildingPrice,
  calcBuildingDailyIncome,
  buildingsList,
  calcBuildingMaxMoney,
} from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import { useUserData, updateUserData } from '../../lib/user'
import api from '../../lib/api'
import Card, { Stat } from '../../components/Card'
import cardStyles from '../../components/Card.module.scss'

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
  2: '#612aab',
  3: '#82BB30',
  4: '#378cd8',
  5: '#d0ac29',
  6: '#A13647',
}

BuildingItem.propTypes = {
  buildingID: PropTypes.number.isRequired,
  taxesPercent: PropTypes.number.isRequired,
  activeScreen: PropTypes.string.isRequired,
}
export default function BuildingItem({ buildingID, taxesPercent, activeScreen }) {
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

  const accumulatedMoney = userData.buildings[buildingID].money

  const maxMoney = calcBuildingMaxMoney({
    buildingID: buildingID,
    buildingAmount: buildingCount,
    bankResearchLevel: userData.researchs[4],
  })
  const moneyClassName = `${accumulatedMoney > maxMoney.maxSafe ? cardStyles.unsafe : ''}`

  return (
    <Card
      image={buildingImages[buildingID]}
      title={buildingInfo.name}
      subtitle={buildingCount.toLocaleString()}
      desc={desc}
      accentColor={buildingAccentColors[buildingID]}>
      {activeScreen === 'buy' && (
        <>
          <Stat img={require('./img/stat-price.png')} title={'Coste'} value={`${coste.toLocaleString()}€`} />
          <Stat img={require('./img/stat-pri.png')} title={'PRI'} value={`${timeToRecoverInvestment} días`} />

          <button
            className={cardStyles.button}
            onClick={buyBuilding}
            disabled={!canBuy}
            style={{ color: buildingAccentColors[buildingID] }}>
            COMPRAR
          </button>
        </>
      )}
      {activeScreen === 'bank' && (
        <>
          <Stat
            img={require('./img/stat-income.png')}
            title={'Bºs / día'}
            value={`${Math.round(income * buildingCount).toLocaleString()}€`}
          />
          <Stat
            img={require('./img/stat-price.png')}
            title={'Banco'}
            value={
              <>
                <span className={moneyClassName}>{Math.floor(accumulatedMoney).toLocaleString()}€</span>
                <span> / </span>
                <span>{maxMoney.maxTotal.toLocaleString()}€</span>
              </>
            }
          />
          <button
            className={cardStyles.button}
            onClick={onExtractMoney}
            style={{ color: buildingAccentColors[buildingID] }}>
            SACAR
          </button>
        </>
      )}
    </Card>
  )
}
