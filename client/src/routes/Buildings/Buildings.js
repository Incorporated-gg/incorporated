import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import './Buildings.scss'
import City from './City'

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

  return error ? <h4>{error}</h4> : <City buildings={buildings} updateBuildingN={updateBuildingN} />
}
