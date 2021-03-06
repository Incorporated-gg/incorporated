import React, { useState } from 'react'
import { cancelActiveMission, getServerTimeString } from 'lib/utils'
import PropTypes from 'prop-types'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { userData } from 'lib/user'
import ErrorBoundary from 'components/UI/ErrorBoundary'
import MissionTimer from '../mission-timer/mission-timer'
import Icon from 'components/icon'
import UserLink from 'components/UI/user-link'
import IncContainer from 'components/UI/inc-container'
import styles from './mission-row.module.scss'
import AttackReport from '../attack-report/attack-report'
import SpyReport from '../spy-report/spy-report'

MissionRow.propTypes = {
  mission: PropTypes.object.isRequired,
  showcaseUser: PropTypes.oneOf(['target', 'sender']),
}
export default function MissionRow({ mission, showcaseUser = 'target' }) {
  const [showDetails, setShowDetails] = useState(false)

  const isComplete = mission.completed
  const isCompleting = !isComplete && new Date(mission.will_finish_at * 1000) <= new Date()
  const cancelMission = () => {
    cancelActiveMission().catch(err => {
      alert(err.message)
    })
  }

  const clickedShowDetails = () => {
    setShowDetails(!showDetails)
  }

  const resultText =
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
      : mission.result || '???'

  const resultColor =
    mission.result === 'lose' || mission.result === 'caught'
      ? '#960000'
      : mission.result === 'win'
      ? '#03540b'
      : '#343434'

  const isMyMission = mission.user.id === userData.id

  const iconProps = mission.mission_type === 'attack' ? { iconName: 'dynamite_stack' } : { iconName: 'spy_map' }

  return (
    <>
      <>
        <div className={styles.firstRow}>
          {showcaseUser === 'sender' && <UserLink user={mission.user} />}
          {showcaseUser === 'target' &&
            (mission.target_hood ? mission.target_hood.name : <UserLink user={mission.target_user} />)}
        </div>
        {isComplete ? (
          <>
            <div className={styles.secondRow}>{getServerTimeString(mission.will_finish_at)}</div>
            <div className={styles.thirdRow}>
              <div
                className={styles.missionTypeContainer}
                onClick={clickedShowDetails}
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  clickedShowDetails()
                }}>
                <IncContainer outerClassName={styles.missionTypeOuter} className={styles.missionTypeInner}>
                  <span style={{ color: resultColor, fontWeight: 700 }}>{resultText}</span>
                  <Icon
                    {...iconProps}
                    size={40}
                    className={styles.missionTypeIcon}
                    alt={mission.mission_type === 'attack' ? 'Ataque' : 'Espionaje'}
                  />
                </IncContainer>
                <div className={styles.detailsText}>{showDetails ? 'Ocultar detalles' : 'Ver detalles'}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.secondRow}>
              <div>
                Edificio:{' '}
                {mission.mission_type === 'attack'
                  ? buildingsList.find(b => b.id === mission.target_building).name
                  : ''}
              </div>
              <Icon svg={iconProps} alt={mission.mission_type === 'attack' ? 'Ataque' : 'Espionaje'} size={20} />
              <div>
                Espías: {mission.sent_spies} Sabots: {mission.sent_sabots} Ladrones: {mission.sent_thieves}
              </div>
            </div>
            <div className={styles.thirdRow}>
              {isCompleting || !isMyMission ? '' : <button onClick={cancelMission}>Cancelar</button>}{' '}
              <MissionTimer finishesAt={mission.will_finish_at} isMyMission={isMyMission} />
            </div>
          </>
        )}
      </>
      {showDetails && (
        <div style={{ marginTop: 10, gridColumn: '1 / 4' }}>
          <ErrorBoundary>
            {mission.mission_type === 'attack' && <AttackReport mission={mission} />}
            {mission.mission_type === 'spy' && <SpyReport mission={mission} />}
          </ErrorBoundary>
        </div>
      )}
      <div className={styles.separator} />
    </>
  )
}
