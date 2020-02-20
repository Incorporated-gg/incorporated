import React, { useState, useEffect } from 'react'
import Username from '../../components/UI/Username'
import { throttle, getTimeUntil, cancelActiveMission } from '../../lib/utils'
import PropTypes from 'prop-types'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { reloadUserData, userData } from '../../lib/user'
import { AttackReportMsg, SpyReportMsg } from '../Messages/SingleMessage'
import { getServerDay } from 'shared-lib/serverTime'
import ErrorBoundary from '../../components/UI/ErrorBoundary'
import { updateTabTitle } from '../../lib/tabTitle'

MissionRow.propTypes = {
  mission: PropTypes.object.isRequired,
  reloadMissionsCallback: PropTypes.func.isRequired,
  showcaseUser: PropTypes.oneOf(['target', 'sender']),
}
export default function MissionRow({ mission, reloadMissionsCallback, showcaseUser = 'target' }) {
  const [showDetails, setShowDetails] = useState(false)

  const isComplete = mission.completed
  const isCompleting = !isComplete && new Date(mission.will_finish_at * 1000) <= new Date()
  const cancelMission = () => {
    cancelActiveMission()
      .then(() => {
        reloadMissionsCallback()
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

  const isMyMission = mission.user.id === userData.id

  return (
    <>
      <tr>
        <td>{mission.mission_type}</td>
        <td>
          <Username user={showcaseUser === 'target' ? mission.target_user : mission.user} />
        </td>
        {isComplete ? (
          <>
            <td>
              Día {getServerDay(mission.will_finish_at * 1000)}. {timestampFromEpoch(mission.will_finish_at)}
            </td>
            <td style={{ color: resultColor }}>{displayResult}</td>
            <td>
              <button onClick={clickedShowDetails}>{showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}</button>
            </td>
          </>
        ) : (
          <>
            <td>
              Spies: {mission.sent_spies} Sabots: {mission.sent_sabots} Thieves: {mission.sent_thieves}
            </td>
            <td>
              {mission.mission_type === 'attack' ? buildingsList.find(b => b.id === mission.target_building).name : ''}
            </td>
            <td>
              <MissionTimer finishesAt={mission.will_finish_at} isMyMission={isMyMission} />
            </td>
            <td>{isCompleting || !isMyMission ? '' : <button onClick={cancelMission}>Cancelar</button>}</td>
          </>
        )}
      </tr>
      {showDetails && (
        <tr>
          <td colSpan="99">
            <ErrorBoundary>
              {mission.mission_type === 'attack' && <AttackReportMsg mission={mission} showSender showTarget />}
              {mission.mission_type === 'spy' && <SpyReportMsg mission={mission} />}
            </ErrorBoundary>
          </td>
        </tr>
      )}
    </>
  )
}

MissionTimer.propTypes = {
  finishesAt: PropTypes.number.isRequired,
  isMyMission: PropTypes.bool.isRequired,
}
export function MissionTimer({ finishesAt, isMyMission }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(finishesAt, true))
  useEffect(() => {
    const int = setInterval(() => setTimeLeft(getTimeUntil(finishesAt, true)), 1000)
    return () => clearInterval(int)
  }, [finishesAt])

  if (isMyMission) {
    updateTabTitle({ missionTimeLeft: timeLeft })
  }

  if (Date.now() / 1000 > finishesAt) {
    throttledReloadUserData()
  }
  return <>{timeLeft}</>
}
const throttledReloadUserData = throttle(reloadUserData, 2000)
