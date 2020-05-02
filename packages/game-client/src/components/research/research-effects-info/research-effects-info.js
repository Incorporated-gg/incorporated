import React from 'react'
import { calcSpiesPower, calcSabotsPower, calcGuardsPower } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import { userData } from 'lib/user'
import { getTimeUntil, numberToAbbreviation } from 'lib/utils'
import Icon from 'components/icon'
import { calcBuildingMaxMoney, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'

ResearchEffectsInfo.propTypes = {
  researchID: PropTypes.number.isRequired,
  currentLevel: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
}
export default function ResearchEffectsInfo({ researchID, currentLevel, price }) {
  switch (researchID) {
    case 1: {
      const powerNow = calcSpiesPower(currentLevel)
      const powerThen = calcSpiesPower(currentLevel + 1)
      return (
        <div>
          Fuerza de espías actual: {powerNow.toLocaleString()}, al subir: {powerThen.toLocaleString()}
        </div>
      )
    }
    case 2: {
      const powerNow = calcSabotsPower(currentLevel)
      const powerThen = calcSabotsPower(currentLevel + 1)
      return (
        <div>
          Fuerza de saboteadores actual: {powerNow.toLocaleString()}, al subir: {powerThen.toLocaleString()}
        </div>
      )
    }
    case 3: {
      const powerNow = calcGuardsPower(currentLevel)
      const powerThen = calcGuardsPower(currentLevel + 1)
      return (
        <div>
          Fuerza de guardias actual: {powerNow.toLocaleString()}, al subir: {powerThen.toLocaleString()}
        </div>
      )
    }
    case 4: {
      const timeNow = getBuildingsTimeUntilFull(currentLevel)
      const timeThen = getBuildingsTimeUntilFull(currentLevel + 1)
      return (
        <div>
          Tiempo medio desde 0 <Icon iconName="money" size={16} /> hasta almacén lleno actual: {timeNow}, al subir:{' '}
          {timeThen}
        </div>
      )
    }
    case 5: {
      const gainedDailyIncome = calculateIncomeDiff(userData.buildings, currentLevel)
      const pri = Math.round((price / gainedDailyIncome) * 10) / 10
      return (
        <div>
          Ingresos diarios ganados: {numberToAbbreviation(gainedDailyIncome)} <Icon iconName="money" size={16} />. PRI:{' '}
          {pri} días
        </div>
      )
    }
    case 6: {
      return (
        <div>
          Si tus guardias son derrotados, tus edificios aguantarán un número mayor de saboteadores antes de ser
          derribados
        </div>
      )
    }
    default: {
      return null
    }
  }
}

function getBuildingsTimeUntilFull(researchLevel) {
  const userBuildings = Object.entries(userData.buildings).map(([buildingID, { quantity }]) => ({
    buildingID: parseInt(buildingID),
    buildingAmount: quantity,
  }))

  const maxMoneyTotal = userBuildings
    .map(
      ({ buildingID, buildingAmount }) =>
        calcBuildingMaxMoney({ buildingID, buildingAmount, bankResearchLevel: researchLevel }).maxTotal
    )
    .reduce((a, b) => a + b, 0)

  const optimizeResearchLevel = userData.researchs[5]
  const dailyIncomeTotal = userBuildings
    .map(({ buildingID, buildingAmount }) => calcBuildingDailyIncome(buildingID, buildingAmount, optimizeResearchLevel))
    .reduce((a, b) => a + b, 0)

  const secondsUntilFull = Math.round((maxMoneyTotal / dailyIncomeTotal) * 60 * 60 * 24 + Date.now() / 1000)

  return getTimeUntil(secondsUntilFull, true)
}

function calculateIncomeDiff(buildings, currentOptimizeLvl) {
  let income = 0
  if (buildings) {
    const oldIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, { quantity }]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl),
      0
    )
    const newIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, { quantity }]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl + 1),
      0
    )
    income = newIncome - oldIncome
  }
  return income
}
