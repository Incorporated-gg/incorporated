import React, { useState, useCallback, useEffect } from 'react'
import api from '../../lib/api'
import { useUserData, reloadUserData } from '../../lib/user'
import { useParams } from 'react-router-dom'
import { personnelList } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'

Mission.propTypes = {
  reloadMissionsCallback: PropTypes.func.isRequired,
}
export default function Mission({ reloadMissionsCallback }) {
  const userData = useUserData()
  const { username: routeUsername } = useParams('username')
  const [toUser, setToUser] = useState(routeUsername || '')
  const [numTroops, setNumTroops] = useState(() => {
    return userData.personnel.spies
  })
  const isFormReady = toUser && numTroops && numTroops > 0

  useEffect(() => {
    setNumTroops(userData.personnel.spies)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const startMission = useCallback(
    e => {
      e.preventDefault()
      if (!isFormReady) return
      api
        .post('/v1/missions', {
          missionType: 'spy',
          target_user: toUser,
          personnel_sent: numTroops,
        })
        .then(() => {
          reloadUserData()
          reloadMissionsCallback()
        })
        .catch(error => alert(error))
    },
    [isFormReady, numTroops, reloadMissionsCallback, toUser]
  )

  const troopName = personnelList.find(p => p.resource_id === 'spies').name

  const missionSeconds = calculateMissionTime('spy', numTroops)

  return (
    <form className="startNewMission">
      <div>
        <label>
          Usuario a espiar
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
      <div>Tiempo de mision: {missionSeconds}s</div>
      <div>
        <button onClick={startMission} disabled={!isFormReady}>
          Enviar
        </button>
      </div>
    </form>
  )
}
