import React, { useCallback } from 'react'
import { calcResearchPrice } from 'shared-lib/researchUtils'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { useUserData } from '../../lib/user'
import Card from './Card'
import { buyResearch } from '../Research/buyResearch'

export default function OptimizeResearch() {
  const userData = useUserData()
  const researchID = 5
  const currentOptimizeLvl = userData.researchs[researchID]
  const coste = calcResearchPrice(researchID, currentOptimizeLvl)

  const income = calculateIncomeDiff(userData.buildings, currentOptimizeLvl)
  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString()
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])

  return (
    <Card
      isResearch
      image={require('./img/central-office.png')}
      title={'Oficina Central'}
      buildingCount={currentOptimizeLvl}
      desc={'Al subir de nivel, el resto de edificios darán más dinero.'}
      coste={coste.toLocaleString()}
      pri={timeToRecoverInvestment}
      dailyIncome={income}
      canBuy={coste < userData.money}
      onBuy={buyResearchClicked}
      accentColor={'#F6901A'}
    />
  )
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
