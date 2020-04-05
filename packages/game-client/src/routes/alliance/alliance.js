import React, { useState, useEffect, useCallback } from 'react'
import api from 'lib/api'

import CreateAlliance from 'components/alliance/alliance-create'
import AllianceRouter from 'routers/alliance'

let lastAllianceData = null
export default function Alliance() {
  const [alliance, setAlliance] = useState(lastAllianceData)
  const [error, setError] = useState(false)

  useEffect(() => {
    lastAllianceData = alliance
  }, [alliance])

  const reloadAllianceData = useCallback(() => {
    api
      .get('/v1/alliance')
      .then(res => {
        setAlliance(res.alliance)
      })
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    reloadAllianceData()
  }, [reloadAllianceData])

  return (
    <>
      {error && <h4>{error}</h4>}
      {alliance === null && <span>Cargando</span>}
      {alliance === false && <CreateAlliance reloadAllianceData={reloadAllianceData} />}
      {alliance && <AllianceRouter reloadAllianceData={reloadAllianceData} alliance={alliance} />}
    </>
  )
}
