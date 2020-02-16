import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { personnelList } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'

MissionModalAttack.propTypes = {
  user: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionModalAttack({ user, onRequestClose }) {
  const userData = useUserData()
  const [toUser, setToUser] = useState((user && user.username) || '')
  const [numSabots, setNumSabots] = useState(userData.personnel.sabots)
  const [numThieves, setNumThieves] = useState(userData.personnel.thieves)
  const [targetBuilding, setTargetBuilding] = useState(1)
  const isFormReady = toUser && (numSabots > 0 || numThieves > 0) && targetBuilding

  useEffect(() => {
    setNumSabots(userData.personnel.sabots)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const startMission = useCallback(
    e => {
      e.preventDefault()
      if (!isFormReady) return
      api
        .post('/v1/missions', {
          missionType: 'attack',
          target_user: toUser,
          sent_sabots: numSabots,
          sent_thieves: numThieves,
          target_building: targetBuilding,
        })
        .then(() => {
          onRequestClose()
        })
        .catch(error => alert(error))
    },
    [isFormReady, numSabots, numThieves, onRequestClose, targetBuilding, toUser]
  )

  const missionSeconds = calculateMissionTime('attack')

  return (
    <>
      <div>
        <label>
          Usuario a atacar
          {': '}
          <input type="text" name="" value={toUser} onChange={e => setToUser(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          {personnelList.find(p => p.resource_id === 'sabots').name}
          {': '}
          <input type="number" name="quantity" value={numSabots} onChange={e => setNumSabots(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          {personnelList.find(p => p.resource_id === 'thieves').name}
          {': '}
          <input type="number" name="quantity" value={numThieves} onChange={e => setNumThieves(e.target.value)} />
        </label>
      </div>
      <label>
        <span>Edificio: </span>
        <select value={targetBuilding} onChange={e => setTargetBuilding(parseInt(e.target.value))}>
          {buildingsList.map(building => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </label>
      <div>Tiempo de mision: {missionSeconds}s</div>
      <div>
        <button onClick={startMission} disabled={!isFormReady}>
          Enviar
        </button>
      </div>
    </>
  )
}
