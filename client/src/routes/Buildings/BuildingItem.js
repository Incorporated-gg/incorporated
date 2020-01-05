import React from 'react'
import { calcBuildingPrice, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import './Buildings.scss'
import { useUserData } from '../../lib/user'
import api from '../../lib/api'

BuildingItem.propTypes = {
  buildingInfo: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  updateBuildingN: PropTypes.func.isRequired,
  style: PropTypes.object,
}
export default function BuildingItem({ style, buildingInfo, count: buildingCount, updateBuildingN }) {
  const userData = useUserData()
  const coste = calcBuildingPrice(buildingInfo.id, buildingCount)
  const income = calcBuildingDailyIncome(buildingInfo.id, 1, userData.researchs[5])
  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString() + ' días'

  const currentOptimizeLvl = userData.researchs[5]
  const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel
  const canAfford = userData.money > coste
  const canBuy = hasEnoughOptimizeLvl && canAfford

  const buyBuilding = async () => {
    try {
      updateBuildingN(buildingCount + 1)
      await api.post('/v1/buy_buildings', { building_id: buildingInfo.id, count: 1 })
    } catch (e) {
      updateBuildingN(buildingCount)
      alert(e.message)
    }
  }

  return (
    <div style={style} className="city-item building-item">
      <div>
        {buildingInfo.name} (<b>{buildingCount.toLocaleString()}</b>)
      </div>
      <div>Bºs/día por edificio: {income.toLocaleString()}€</div>
      <div>PRI: {timeToRecoverInvestment}</div>
      <div>Precio: {coste.toLocaleString()}€</div>
      {!hasEnoughOptimizeLvl && <div>Necesitas oficina central nivel {buildingInfo.requiredOptimizeResearchLevel}</div>}
      <button className="build-button" disabled={canBuy} onClick={canBuy ? buyBuilding : undefined}>
        Construir
      </button>
    </div>
  )
}
