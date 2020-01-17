import React, { useState, useEffect } from 'react'
import Username from '../../components/Username'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { getTimeUntil } from '../../lib/utils'
import { reloadUserData, userData } from '../../lib/user'
import { AttackReportMsg } from '../Messages/SingleMessage'

MissionRow.propTypes = {
  mission: PropTypes.object.isRequired,
  reloadMissionsCallback: PropTypes.func.isRequired,
}
export default function MissionRow({ mission, reloadMissionsCallback }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(mission.will_finish_at))
  const [showDetails, setShowDetails] = useState(false)

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

  const clickedShowDetails = () => {
    setShowDetails(!showDetails)
  }

  const displayResult =
    mission.result === 'win'
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

  const resultColor =
    mission.result === 'win'
      ? '#006100'
      : mission.result === 'lose' || mission.result === 'caught'
      ? '#960000'
      : 'inherit'

  return (
    <>
      <tr>
        <td>{mission.mission_type}</td>
        <td>
          <Username user={mission.target_user} />
        </td>
        {isComplete ? (
          <>
            <td>{timestampFromEpoch(mission.will_finish_at)}</td>
            <td style={{ color: resultColor }}>{displayResult}</td>
            <td>
              <button onClick={clickedShowDetails}>{showDetails ? 'Ocultar detalles' : 'Ver detalles'}</button>
            </td>
          </>
        ) : (
          <>
            <td>
              Spies: {mission.sent_spies} Sabots: {mission.sent_sabots} Thiefs: {mission.sent_thiefs}
            </td>
            <td>
              {mission.mission_type === 'attack' ? buildingsList.find(b => b.id === mission.target_building).name : ''}
            </td>
            <td>{isCompleting ? 'Completando...' : `${timeLeft.minutes}:${timeLeft.seconds}`}</td>
            <td>
              {isCompleting || mission.user.id !== userData.id ? '' : <button onClick={cancelMission}>Cancelar</button>}
            </td>
          </>
        )}
      </tr>
      {showDetails && (
        <tr>
          <td colSpan="99">
            <AttackReportMsg mission={mission} showSender showTarget />
          </td>
        </tr>
      )}
    </>
  )
}
