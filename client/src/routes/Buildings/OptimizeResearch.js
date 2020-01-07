import React, { useCallback } from 'react'
import { calcResearchPrice } from 'shared-lib/researchUtils'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { useUserData, updateUserData } from '../../lib/user'
import PropTypes from 'prop-types'
import Card from './Card'
import api from '../../lib/api'

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

  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString()
  const researchID = 5
  const buyResearch = useCallback(async () => {
    try {
      await api.post('/v1/research/buy', { research_id: researchID, count: 1 })
      const newCount = userData.researchs[researchID] + 1
      updateUserData({ researchs: Object.assign({}, userData.researchs, { [researchID]: newCount }) })
    } catch (e) {
      alert(e.message)
    }
  }, [researchID, userData.researchs])

  return (
    <Card
      image={require('./img/central-office.png')}
      title={'Oficina Central'}
      subtitle={currentOptimizeLvl.toLocaleString()}
      desc={
        'El corazón de tu empresa. Al subir de nivel, desbloqueas nuevos edificios, y el resto de edificios darán más dinero'
      }
      coste={coste.toLocaleString()}
      pri={timeToRecoverInvestment}
      beneficios={income.toLocaleString()}
      canBuy={coste < userData.money}
      onBuy={buyResearch}
      accentColor={'#EC9B3B'}
    />
  )
}
