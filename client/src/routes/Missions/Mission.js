import React, { useState, useCallback, useEffect } from 'react'
import api from '../../lib/api'
import { useUserData, reloadUserData } from '../../lib/user'
import { useParams } from 'react-router-dom'
import { buildingsList } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'

Mission.propTypes = {
  reloadMissionsCallback: PropTypes.func.isRequired,
}
export default function Mission({ reloadMissionsCallback }) {
  const userData = useUserData()
  const { username: routeUsername, missionType } = useParams()
  const isAttack = missionType === 'attack'
  const [toUser, setToUser] = useState(routeUsername || '')
  const [numTroops, setNumTroops] = useState(() => {
    return isAttack ? userData.personnel.sabots : userData.personnel.spies
  })
  const [targetBuilding, setTargetBuilding] = useState(1)
  const isFormReady = toUser && missionType && numTroops && numTroops > 0 && targetBuilding

  useEffect(() => {
    setNumTroops(isAttack ? userData.personnel.sabots : userData.personnel.spies)
  }, [isAttack, userData.personnel.sabots, userData.personnel.spies])

  const startMission = useCallback(() => {
    isAttack
      ? api
          .post('/v1/missions', {
            missionType,
            target_user: toUser,
            personnel_sent: numTroops,
            target_building: targetBuilding,
          })
          .then(() => {
            reloadUserData()
            reloadMissionsCallback()
          })
          .catch(error => alert(error))
      : api
          .post('/v1/missions', {
            missionType,
            target_user: toUser,
            personnel_sent: numTroops,
          })
          .then(() => {
            reloadUserData()
            reloadMissionsCallback()
          })
          .catch(error => alert(error))
  }, [isAttack, missionType, numTroops, reloadMissionsCallback, targetBuilding, toUser])

  return (
    <div className={`startNewMission${isFormReady ? '' : ' notReady'}`}>
      <div>
        Usuario a {isAttack ? 'atacar' : 'espiar'}:
        <input type="text" name="" value={toUser} onChange={e => setToUser(e.target.value)} />
      </div>
      <div>
        {isAttack ? 'Sabots' : 'Espías'}:{' '}
        <input type="number" name="quantity" value={numTroops} onChange={e => setNumTroops(e.target.value)} />
      </div>
      {isAttack && (
        <>
          <span>Edificio:</span>
          <select value={targetBuilding} onChange={e => setTargetBuilding(e.target.value)}>
            {buildingsList.map(building => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </>
      )}
      <button type="button" onClick={isFormReady ? startMission : undefined}>
        Enviar
      </button>
    </div>
  )
}
