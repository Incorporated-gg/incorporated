import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { buildingsList, calcBuildingPrice, calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import './Buildings.scss'
import { useUserData } from '../../lib/user'
import OptimizeResearch from './OptimizeResearch'

let lastBuildingsData = null
export default function Buildings() {
  const [buildings, setBuildings] = useState(lastBuildingsData)
  const [error, setError] = useState(false)

  useEffect(() => {
    lastBuildingsData = buildings
  }, [buildings])

  useEffect(() => {
    api
      .get('/v1/buildings')
      .then(res => {
        setBuildings(res.buildings)
      })
      .catch(err => setError(err.message))
  }, [])

  const buyBuilding = buildingID => async () => {
    const oldCount = buildings[buildingID]
    const updateBuildingN = newN => setBuildings(Object.assign({}, buildings, { [buildingID]: newN }))
    try {
      updateBuildingN(oldCount + 1)
      await api.post('/v1/buy_buildings', { building_id: buildingID, count: 1 })
    } catch (e) {
      updateBuildingN(oldCount)
      alert(e.message)
    }
  }

  return (
    <>
      {error && <h4>{error}</h4>}
      <OptimizeResearch buildings={buildings} />
      <br />
      {buildingsList.map(building => (
        <Building
          key={building.id}
          buildingInfo={building}
          count={buildings ? buildings[building.id] : 0}
          buy={buyBuilding(building.id)}
        />
      ))}
    </>
  )
}

Building.propTypes = {
  buildingInfo: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  buy: PropTypes.func.isRequired,
}
function Building({ buildingInfo, count: buildingCount, buy }) {
  const userData = useUserData()
  const coste = calcBuildingPrice(buildingInfo.id, buildingCount)
  const income = calcBuildingDailyIncome(buildingInfo.id, 1, userData.researchs[5])
  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString() + ' días'

  const currentOptimizeLvl = userData.researchs[5]
  const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel
  const canAfford = userData.money > coste
  const canBuy = hasEnoughOptimizeLvl && canAfford

  return (
    <div className={`building-item ${canBuy ? '' : 'can-not-afford'}`}>
      <div>
        {buildingInfo.name} (<b>{buildingCount.toLocaleString()}</b>)
      </div>
      <div>Bºs/día por edificio: {income.toLocaleString()}€</div>
      <div>PRI: {timeToRecoverInvestment}</div>
      <div>Precio: {coste.toLocaleString()}€</div>
      {!hasEnoughOptimizeLvl && <div>Necesitas oficina central nivel {buildingInfo.requiredOptimizeResearchLevel}</div>}
      <button className="build-button" onClick={canBuy ? buy : undefined}>
        Construir
      </button>
    </div>
  )
}
