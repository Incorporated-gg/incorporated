import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import './Buildings.scss'
import BuildingItem from './BuildingItem'
import OptimizeResearch from './OptimizeResearch'
import { buildingsList } from 'shared-lib/buildingsUtils'

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

  const updateBuildingN = (buildingID, newN) => {
    setBuildings(Object.assign({}, buildings, { [buildingID]: newN }))
  }

  if (error) return <h4>{error}</h4>

  return (
    <div className="buildings-list">
      <div className="background" />
      <div className="content">
        <OptimizeResearch buildings={buildings} />
        {buildingsList.map(buildingInfo => (
          <BuildingItem
            key={buildingInfo.id}
            buildingInfo={buildingInfo}
            buildingCount={buildings ? buildings[buildingInfo.id] : 0}
            updateBuildingN={updateBuildingN}
          />
        ))}
      </div>
    </div>
  )
}
