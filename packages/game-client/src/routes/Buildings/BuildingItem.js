import React, { useCallback, useMemo } from 'react'
import {
  calcBuildingPrice,
  calcBuildingDailyIncome,
  buildingsList,
  calcBuildingMaxMoney,
} from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import { userData as userDataRaw, useUserData, updateUserData } from '../../lib/user'
import api from '../../lib/api'
import Card, { Stat } from '../../components/Card'
import cardStyles from '../../components/Card.module.scss'
import { buyBuilding } from './buyBuilding'
import useHoldPress from '../../lib/useHoldPress'

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
  activeScreen: PropTypes.string.isRequired,
}
export default function BuildingItem({ buildingID, activeScreen }) {
  const userData = useUserData()
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  const buildingCount = userData.buildings[buildingID].quantity
  const coste = calcBuildingPrice(buildingID, buildingCount)
  const income = calcBuildingDailyIncome(buildingID, 1, userData.researchs[5])

  const currentOptimizeLvl = userData.researchs[5]
  const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel

  let desc = buildingDescriptions[buildingID]
  if (!hasEnoughOptimizeLvl)
    desc = `${desc}\nNecesitas oficina central nivel ${buildingInfo.requiredOptimizeResearchLevel}.`

  return (
    <Card
      image={buildingImages[buildingID]}
      title={buildingInfo.name}
      subtitle={buildingCount.toLocaleString()}
      desc={desc}
      accentColor={buildingAccentColors[buildingID]}>
      {activeScreen === 'buy' && (
        <BuyScreen buildingID={buildingID} income={income} coste={coste} hasEnoughOptimizeLvl={hasEnoughOptimizeLvl} />
      )}
      {activeScreen === 'bank' && <ExtractScreen buildingID={buildingID} income={income} />}
    </Card>
  )
}

BuyScreen.propTypes = {
  buildingID: PropTypes.number.isRequired,
  coste: PropTypes.number.isRequired,
  income: PropTypes.number.isRequired,
  hasEnoughOptimizeLvl: PropTypes.bool.isRequired,
}
function BuyScreen({ buildingID, coste, income, hasEnoughOptimizeLvl }) {
  const canAfford = userDataRaw.money > coste
  const canBuy = hasEnoughOptimizeLvl && canAfford

  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString()

  const onBuyBuildingPressed = useCallback(() => buyBuilding(buildingID), [buildingID])
  const buyHoldPress = useHoldPress({
    callback: onBuyBuildingPressed,
    rampUpMs: 2500,
    initialMs: 600,
    endMs: 100,
  })

  return (
    <>
      <Stat img={require('./img/stat-price.png')} title={'Coste'} value={`${coste.toLocaleString()}€`} />
      <Stat img={require('./img/stat-pri.png')} title={'PRI'} value={`${timeToRecoverInvestment} días`} />

      <button
        {...buyHoldPress}
        className={cardStyles.button}
        disabled={!canBuy}
        style={{ color: buildingAccentColors[buildingID] }}>
        COMPRAR
      </button>
    </>
  )
}

ExtractScreen.propTypes = {
  buildingID: PropTypes.number.isRequired,
  income: PropTypes.number.isRequired,
}
function ExtractScreen({ buildingID, income }) {
  const buildingCount = userDataRaw.buildings[buildingID].quantity
  const accumulatedMoney = userDataRaw.buildings[buildingID].money

  const maxMoney = useMemo(
    () =>
      calcBuildingMaxMoney({
        buildingID: buildingID,
        buildingAmount: buildingCount,
        bankResearchLevel: userDataRaw.researchs[4],
      }),
    [buildingID, buildingCount]
  )
  const moneyClassName = `${accumulatedMoney > maxMoney.maxSafe ? cardStyles.unsafe : ''}`

  const onExtractMoney = useCallback(async () => {
    try {
      const extractedMoney = userDataRaw.buildings[buildingID].money
      updateUserData({
        money: userDataRaw.money + extractedMoney,
        buildings: {
          ...userDataRaw.buildings,
          [buildingID]: { ...userDataRaw.buildings[buildingID], money: 0 },
        },
      })
      await api.post('/v1/buildings/extract_money', { building_id: buildingID })
    } catch (e) {
      alert(e.message)
    }
  }, [buildingID])

  return (
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
  )
}
