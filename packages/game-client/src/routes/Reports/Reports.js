import React, { useState, useEffect, useCallback, useRef } from 'react'
import api from 'lib/api'
import styles from './Reports.module.scss'
import IncContainer from 'components/UI/inc-container'
import MissionRow from 'components/reports/mission-row/mission-row'
import SimulatorModal from 'components/simulator-modal/simulator-modal'
import IncButton from 'components/UI/inc-button'
import { useUserData } from 'lib/user'
import MissionLimitsCounter from 'components/reports/mission-limits-counter/mission-limits-counter'
import { MAX_ACCUMULATED_ATTACKS } from 'shared-lib/missionsUtils'
import DiamondSwitch from 'components/reports/diamond-switch/diamond-switch'
import Icon from 'components/icon'

const initialMissionsState = {
  missions: [],
  todaysMissionLimits: {
    receivedToday: 0,
    attacksLeft: 6,
    maxDefenses: 6,
  },
  notSeenReceivedCount: 0,
  notSeenSentCount: 0,
}

export default function Reports() {
  const userData = useUserData()
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)

  const [missions, setMissions] = useState(initialMissionsState)

  const [sendType, setSendType] = useState('sent')
  const [missionType, setMissionType] = useState('any')
  const [ownerType, setOwnerType] = useState('own')

  const reloadMissionsCallback = useCallback(() => {
    setMissions({ ...missions, missions: [] })
    api
      .get('/v1/missions', {
        sendType,
        missionType,
        ownerType,
      })
      .then(res => {
        if (res.notSeenSentCount === 0 && res.notSeenReceivedCount > 0) setSendType('received')
        else setMissions(res)
      })
      .catch(err => alert(err.message))
  }, [missionType, missions, ownerType, sendType])

  // Reload on mission end
  const reloadOnMissionEnd = useRef(false)
  useEffect(() => {
    if (sendType !== 'sent') return

    if (userData.active_mission) {
      reloadOnMissionEnd.current = true
      return
    }
    if (!reloadOnMissionEnd.current) return

    reloadOnMissionEnd.current = false
    reloadMissionsCallback()
  }, [reloadMissionsCallback, sendType, userData.active_mission])

  // Reload on start, and on type filters changed
  useEffect(() => {
    reloadMissionsCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionType, ownerType, sendType])

  return (
    <>
      <div className={styles.filtersContainer}>
        <MissionLimitsCounter
          title={'Ataques disponibles'}
          iconName="dynamite_stack"
          maxMissions={MAX_ACCUMULATED_ATTACKS}
          currentMissions={missions.todaysMissionLimits.attacksLeft}
        />
        <DiamondSwitch
          options={{
            spy: <Icon iconName="spy_map" size={16} />,
            any: 'Todo',
            attack: <Icon iconName="dynamite_stack" size={16} />,
          }}
          selected={missionType}
          onOptionSelected={setMissionType}
        />
        <MissionLimitsCounter
          title={'Ataques recibidos hoy'}
          iconName="guard"
          maxMissions={missions.todaysMissionLimits.maxDefenses}
          currentMissions={missions.todaysMissionLimits.maxDefenses - missions.todaysMissionLimits.receivedToday}
        />
        <DiamondSwitch
          options={{
            sent: 'ENVIADOS',
            received: 'RECIBIDOS',
          }}
          selected={sendType}
          onOptionSelected={setSendType}
        />
        <DiamondSwitch
          options={{
            own: 'PROPIOS',
            alliance: 'CORPORACIÓN',
          }}
          selected={ownerType}
          onOptionSelected={setOwnerType}
        />
        <IncButton onClick={() => setShowSimulatorModal(true)}>Sim.</IncButton>
      </div>
      <SimulatorModal isOpen={showSimulatorModal} onRequestClose={() => setShowSimulatorModal(false)} />

      <IncContainer darkBg>
        <div className={styles.missionContainer}>
          {missions.missions.length ? (
            missions.missions.map((mission, index) => (
              <MissionRow key={index} mission={mission} showcaseUser={sendType === 'received' ? 'sender' : 'target'} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / 4' }}>
              {sendType === 'sent'
                ? 'No has realizado ninguna misión todavía'
                : 'No has recibido ninguna misión todavía'}
            </div>
          )}
        </div>
      </IncContainer>
    </>
  )
}
