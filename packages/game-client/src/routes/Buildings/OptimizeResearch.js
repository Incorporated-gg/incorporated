import React, { useCallback } from 'react'
import { calcResearchPrice } from 'shared-lib/researchUtils'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { useUserData } from 'lib/user'
import Card from 'components/card'
import Stat from 'components/stat'
import { buyResearch } from '../Research/buyResearch'
import cardStyles from 'components/card/card.module.scss'
import PropTypes from 'prop-types'

OptimizeResearch.propTypes = {
  activeScreen: PropTypes.string.isRequired,
}
export default function OptimizeResearch({ activeScreen }) {
  const userData = useUserData()
  const researchID = 5
  const currentOptimizeLvl = userData.researchs[researchID]
  const coste = calcResearchPrice(researchID, currentOptimizeLvl)

  const income = calculateIncomeDiff(userData.buildings, currentOptimizeLvl)
  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString()
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])

  return (
    <Card
      image={require('./img/central-office.png')}
      title={'Oficina Central'}
      ribbon={`Lvl. ${currentOptimizeLvl.toLocaleString()}`}
      desc={'Al subir de nivel, el resto de edificios darán más dinero.'}>
      {activeScreen === 'buy' && (
        <>
          <Stat img={require('./img/stat-price.png')} title={'Coste'} value={`${coste.toLocaleString()}€`} />
          <Stat img={require('./img/stat-pri.png')} title={'PRI'} value={`${timeToRecoverInvestment} días`} />

          <button className={cardStyles.button} onClick={buyResearchClicked} disabled={coste >= userData.money}>
            MEJORAR
          </button>
        </>
      )}
    </Card>
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
