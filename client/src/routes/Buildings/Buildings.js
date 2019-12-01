import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import buildingsUtils from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'

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
      await api.post('/v1/buy_buildings', { building_id: buildingID, count: 1 })
      updateBuildingN(oldCount + 1)
    } catch (e) {
      updateBuildingN(oldCount)
      alert(e.message)
    }
  }

  return (
    <div>
      <h2>Buildings</h2>
      {error && <h4>{error}</h4>}
      {buildingsUtils.buildingsList.map(b => (
        <Building key={b.id} building={b} count={buildings ? buildings[b.id] : 0} buy={buyBuilding(b.id)} />
      ))}
    </div>
  )
}

Building.propTypes = {
  building: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  buy: PropTypes.func.isRequired,
}
function Building({ building, count, buy }) {
  const coste = Math.ceil(buildingsUtils.calcBuildingPrice(building.id, count)).toLocaleString()
  return (
    <div>
      <span>{building.name}: </span>
      <span>{count}. </span>
      <span>Precio: {coste}. </span>
      <button onClick={buy}>Construir</button>
    </div>
  )
}
