import React, { useState } from 'react'
import Username from 'components/UI/Username'
import { cancelActiveMission } from 'lib/utils'
import PropTypes from 'prop-types'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { userData } from 'lib/user'
import { AttackReportMsg, SpyReportMsg } from 'components/messages/components/single-message'
import { getServerDay } from 'shared-lib/serverTime'
import ErrorBoundary from 'components/UI/ErrorBoundary'
import MissionTimer from '../mission-timer/mission-timer'
import Icon from 'components/icon'

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

  const iconSvg = mission.mission_type === 'attack' ? require('./img/attack.svg') : require('./img/spy.svg')

  return (
    <>
      <tr>
        <td>
          <Icon svg={iconSvg} alt={mission.mission_type === 'attack' ? 'Ataque' : 'Espionaje'} size={20} />
        </td>
        <td>
          {showcaseUser === 'sender' && <Username user={mission.user} />}
          {showcaseUser === 'target' &&
            (mission.target_hood ? mission.target_hood.name : <Username user={mission.target_user} />)}
        </td>
        {isComplete ? (
          <>
            <td>{getServerDay(mission.will_finish_at * 1000)}</td>
            <td style={{ color: resultColor }}>{displayResult}</td>
            <td>
              <button onClick={clickedShowDetails}>{showDetails ? '⬆' : '⬇'}</button>
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
