import React from 'react'
import ResearchItem from '../Research/ResearchItem'
import { calcResearchPrice } from 'shared-lib/researchUtils'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { useUserData } from '../../lib/user'
import PropTypes from 'prop-types'

OptimizeResearch.propTypes = {
  buildings: PropTypes.object,
}
export default function OptimizeResearch({ buildings }) {
  const userData = useUserData()
  const currentOptimizeLvl = userData.researchs[5]
  const coste = calcResearchPrice(5, currentOptimizeLvl)

  let income = 0
  if (buildings) {
    const oldIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, quantity]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl),
      0
    )
    const newIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, quantity]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl + 1),
      0
    )
    income = newIncome - oldIncome
  }

  const timeToRecoverResarch = (Math.round((coste / income) * 10) / 10).toLocaleString() + ' días'
  return (
    <ResearchItem researchID={5}>
      <div>El resto de edificios darán más dinero</div>
      <div>PRI: {timeToRecoverResarch}</div>
    </ResearchItem>
  )
}
