import React, { useState, useCallback, useEffect } from 'react'
import api from '../../lib/api'
import { useUserData, reloadUserData } from '../../lib/user'
import { useParams } from 'react-router-dom'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { personnelList } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import styles from './Missions.module.scss'

Mission.propTypes = {
  reloadMissionsCallback: PropTypes.func.isRequired,
}
export default function Mission({ reloadMissionsCallback }) {
  const userData = useUserData()
  const { username: routeUsername } = useParams('username')
  const [toUser, setToUser] = useState(routeUsername || '')
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
          reloadUserData()
          reloadMissionsCallback()
        })
        .catch(error => alert(error))
    },
    [isFormReady, numSabots, numThieves, reloadMissionsCallback, targetBuilding, toUser]
  )

  const missionSeconds = calculateMissionTime('attack')

  return (
    <form className={styles.startNewMission}>
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
    </form>
  )
}
