import React, { useState, useEffect } from 'react'
import Username from '../../components/Username'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { getTimeUntil } from '../../lib/utils'
import { reloadUserData, userData } from '../../lib/user'

MissionRow.propTypes = {
  mission: PropTypes.object.isRequired,
  reloadMissionsCallback: PropTypes.func.isRequired,
}
export default function MissionRow({ mission, reloadMissionsCallback }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(mission.will_finish_at))
  useEffect(() => {
    const int = setInterval(() => setTimeLeft(getTimeUntil(mission.will_finish_at)))
    return () => clearInterval(int)
  }, [mission.will_finish_at])

  const isComplete = mission.completed
  const isCompleting = !isComplete && new Date(mission.will_finish_at * 1000) <= new Date()
  const cancelMission = () => {
    api
      .post('/v1/missions/cancel', { started_at: mission.started_at })
      .then(() => {
        reloadMissionsCallback()
        reloadUserData()
      })
      .catch(err => {
        reloadMissionsCallback()
        alert(err.message)
      })
  }

  const openDetailsModal = () => {
    window.alert(JSON.stringify(mission))
  }

  const displayResult =
    mission.result === 'won'
      ? 'Éxito'
      : mission.result === 'lose'
      ? 'Fracaso'
      : mission.result === 'draw'
      ? 'Empate'
      : mission.result === 'caught'
      ? 'Cazado'
      : mission.result === 'not_caught'
      ? 'No Cazado'
      : mission.result

  const profit = typeof mission.profit === 'number' ? `(${mission.profit.toLocaleString()}€)` : null

  return (
    <tr>
      <td>{mission.mission_type}</td>
      <td>
        <Username user={mission.target_user} />
      </td>
      {isComplete ? (
        <>
          <td>{timestampFromEpoch(mission.will_finish_at)}</td>
          <td>
            {displayResult} <i>{profit}</i>
          </td>
          <td>
            <button onClick={openDetailsModal}>Ver detalles</button>
          </td>
        </>
      ) : (
        <>
          <td>{mission.personnel_sent}</td>
          <td>
            {mission.mission_type === 'attack'
              ? buildingsList.find(b => b.id === parseInt(mission.target_building)).name
              : ''}
          </td>
          <td>{isCompleting ? 'Completando...' : `${timeLeft.minutes}:${timeLeft.seconds}`}</td>
          <td>
            {isCompleting || mission.user_id !== userData.id ? '' : <button onClick={cancelMission}>Cancelar</button>}
          </td>
        </>
      )}
    </tr>
  )
}
