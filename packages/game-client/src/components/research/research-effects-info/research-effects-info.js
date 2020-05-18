import React from 'react'
import { calcSpiesPower, calcSabotsPower, calcGuardsPower } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import { userData } from 'lib/user'
import { getTimeUntil, numberToAbbreviation } from 'lib/utils'
import Icon from 'components/icon'
import { calcBuildingMaxMoney, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import styles from './research-effects-info.module.scss'

ResearchEffectsInfo.propTypes = {
  researchID: PropTypes.number.isRequired,
  currentLevel: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
}
export default function ResearchEffectsInfo({ researchID, currentLevel, price }) {
  let desc = ''
  let powerNow = 0
  let powerThen = 0
  switch (researchID) {
    case 1: {
      powerNow = calcSpiesPower(currentLevel)
      powerThen = calcSpiesPower(currentLevel + 1)
      desc = 'Consigue inteligencia sobre tus enemigos, y protege la tuya.'
      break
    }
    case 2: {
      powerNow = calcSabotsPower(currentLevel)
      powerThen = calcSabotsPower(currentLevel + 1)
      desc = 'Mejora la fuerza de tus Gangsters y Ladrones al atacar'
      break
    }
    case 3: {
      powerNow = calcGuardsPower(currentLevel)
      powerThen = calcGuardsPower(currentLevel + 1)
      desc = 'Mejora la fuerza de tus Guardias al defender'
      break
    }
    case 4: {
      powerNow = getBuildingsTimeUntilFull(currentLevel)
      powerThen = getBuildingsTimeUntilFull(currentLevel + 1)
      desc = (
        <>
          Tiempo medio desde 0 <Icon iconName="money" size={16} /> hasta almacén lleno
        </>
      )
      break
    }
    case 5: {
      const incomes = calculateIncomeAfterResearch(userData.buildings, currentLevel)
      powerNow = numberToAbbreviation(incomes.oldIncome)
      powerThen = numberToAbbreviation(incomes.newIncome)
      const diff = incomes.newIncome - incomes.oldIncome
      const pri = Math.round((price / diff) * 10) / 10
      desc = (
        <>
          <p>
            Ingresos diarios ganados: {numberToAbbreviation(diff)}
            <Icon iconName="money" size={16} />
          </p>
          <p>PRI: {pri} días</p>
        </>
      )
      break
    }
    case 6: {
      desc = (
        <>
          Si tus guardias son derrotados, tus edificios aguantarán un número mayor de gángsters antes de ser derribados
        </>
      )
      break
    }
    default: {
      return null
    }
  }

  return (
    <>
      <div>{desc}</div>
      {!powerThen ? (
        ''
      ) : (
        <div className={styles.statContainer}>
          <span>{powerNow}</span>
          <Icon iconName="arrows" width={30} height={18} />
          <span>{powerThen}</span>
        </div>
      )}
    </>
  )
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

  const secondsUntilFull = (maxMoneyTotal / dailyIncomeTotal) * 60 * 60 * 24
  const timeWhenFull = Math.floor(secondsUntilFull + Date.now() / 1000)
  const timeUntil = getTimeUntil(timeWhenFull)

  return `${timeUntil.hours}h\xA0${timeUntil.minutes}m`
}

function calculateIncomeAfterResearch(buildings, currentOptimizeLvl) {
  let oldIncome = 0
  let newIncome = 0
  if (buildings) {
    oldIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, { quantity }]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl),
      0
    )
    newIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, { quantity }]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl + 1),
      0
    )
  }
  return {
    newIncome,
    oldIncome,
  }
}
