import React, { useState, useEffect, useCallback } from 'react'
import api from 'lib/api'
import IncContainer from 'components/UI/inc-container'
import AllianceLink from '../alliance-link'
import IncButton from 'components/UI/inc-button'

export default function AllianceWarAidRequests() {
  const [warRequests, setWarRequests] = useState([])
  const [error, setError] = useState()

  const reloadWarRequests = useCallback(() => {
    api
      .get('/v1/alliance/war_aid/list')
      .then(res => {
        setWarRequests(res.war_requests)
      })
      .catch(e => {
        setError(e.message)
      })
  }, [])

  useEffect(() => {
    reloadWarRequests()
  }, [reloadWarRequests])

  const acceptWarRequest = (warID, aidedAllianceID) => {
    api
      .post('/v1/alliance/war_aid/accept', {
        war_id: warID,
        aided_alliance_id: aidedAllianceID,
      })
      .then(reloadWarRequests)
      .catch(e => window.alert(e.message))
  }
  const rejectWarRequest = (warID, aidedAllianceID) => {
    api
      .post('/v1/alliance/war_aid/reject', {
        war_id: warID,
        aided_alliance_id: aidedAllianceID,
      })
      .then(reloadWarRequests)
      .catch(e => window.alert(e.message))
  }

  if (error) return error

  return (
    <IncContainer darkBg outerStyle={{ marginBottom: 10 }}>
      <div style={{ padding: 10 }}>
        <h2>Peticiones de ayuda</h2>
        {warRequests.map(warRequest => {
          return (
            <div key={warRequest.war.id}>
              <AllianceLink alliance={warRequest.alliance} />
              <IncButton onClick={() => acceptWarRequest(warRequest.war.id, warRequest.alliance.id)}>Aceptar</IncButton>
              <IncButton onClick={() => rejectWarRequest(warRequest.war.id, warRequest.alliance.id)}>
                Rechazar
              </IncButton>
            </div>
          )
        })}
      </div>
    </IncContainer>
  )
}
