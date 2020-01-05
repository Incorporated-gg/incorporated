import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { buildingsList } from 'shared-lib/buildingsUtils'
import './Buildings.scss'
import BuildingItem from './BuildingItem'
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

  const updateBuildingN = buildingID => newN => setBuildings(Object.assign({}, buildings, { [buildingID]: newN }))

  const positions = {
    research: { top: 20, left: 98 },
    b1: { top: 8, left: 23 },
    b2: { top: 82, left: 42 },
    b3: { top: 1, left: 80 },
    b4: { top: 40, left: 25 },
    b5: { top: 59, left: 85 },
    b6: { top: 95, left: 83 },
  }
  const citySize = { width: 720, height: 1000 }
  const cityZoom = Math.min(1, window.innerWidth / citySize.width)
  function getTransformFromPos(pos) {
    const pxLeft = (pos.left / 100) * citySize.width
    const perLeft = pos.left
    const pxTop = (pos.top / 100) * citySize.height
    const perTop = pos.top
    return `translate(calc(${pxLeft}px - ${perLeft}%), calc(${pxTop}px - ${perTop}%))`
  }

  return (
    <>
      {error && <h4>{error}</h4>}
      <div className="city-container">
        <div className="city" style={{ width: citySize.width, height: citySize.height, zoom: cityZoom }}>
          <div className="city-bg" />
          <OptimizeResearch style={{ transform: getTransformFromPos(positions['research']) }} buildings={buildings} />
          {buildingsList.map(building => {
            return (
              <BuildingItem
                style={{ transform: getTransformFromPos(positions['b' + building.id]) }}
                key={building.id}
                buildingInfo={building}
                count={buildings ? buildings[building.id] : 0}
                updateBuildingN={updateBuildingN(building.id)}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
