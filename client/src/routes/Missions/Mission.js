import React, { useState, useCallback, useEffect } from 'react'
import api from '../../lib/api'
import { useUserData, reloadUserData } from '../../lib/user'
import { useParams } from 'react-router-dom'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { personnelList } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
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
    return isAttack ? userData.personnel.sabots : userData.personnel.hackers
  })
  const [targetBuilding, setTargetBuilding] = useState(1)
  const isFormReady = toUser && missionType && numTroops && numTroops > 0 && targetBuilding

  useEffect(() => {
    setNumTroops(isAttack ? userData.personnel.sabots : userData.personnel.hackers)
  }, [isAttack, userData.personnel.sabots, userData.personnel.hackers])

  const startMission = useCallback(
    e => {
      e.preventDefault()
      if (!isFormReady) return
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
    },
    [isAttack, isFormReady, missionType, numTroops, reloadMissionsCallback, targetBuilding, toUser]
  )

  const resourceID = isAttack ? 'sabots' : 'hackers'
  const troopName = personnelList.find(p => p.resource_id === resourceID).name

  const missionSeconds = calculateMissionTime(missionType, numTroops)

  return (
    <form className="startNewMission">
      <div>
        <label>
          Usuario a {isAttack ? 'atacar' : 'hackear'}
          {': '}
          <input type="text" name="" value={toUser} onChange={e => setToUser(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          {troopName}
          {': '}
          <input type="number" name="quantity" value={numTroops} onChange={e => setNumTroops(e.target.value)} />
        </label>
      </div>
      {isAttack && (
        <label>
          <span>Edificio: </span>
          <select value={targetBuilding} onChange={e => setTargetBuilding(e.target.value)}>
            {buildingsList.map(building => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div>Tiempo de mision: {missionSeconds}s</div>
      <div>
        <button onClick={startMission} disabled={!isFormReady}>
          Enviar
        </button>
      </div>
    </form>
  )
}
