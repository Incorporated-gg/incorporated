import React, { useState, useEffect, useCallback, useRef } from 'react'
import api from 'lib/api'
import styles from './Reports.module.scss'
import IncContainer from 'components/UI/inc-container'
import MissionRow from 'components/reports/mission-row/mission-row'
import SimulatorModal from 'components/simulator-modal/simulator-modal'
import IncButton from 'components/UI/inc-button'
import IncInput from 'components/UI/inc-input/inc-input'
import { useUserData } from 'lib/user'

const initialMissionsState = {
  missions: [],
  todaysMissionLimits: {
    receivedToday: 0,
    attacksLeft: 0,
    maxDefenses: 0,
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
    setMissions(initialMissionsState)
    api
      .get('/v1/missions', {
        sendType,
        missionType,
        ownerType,
      })
      .then(res => {
        if (res.notSeenReceivedCount > 0) setSendType('received')
        setMissions(res)
      })
      .catch(err => alert(err.message))
  }, [missionType, ownerType, sendType])

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
  useEffect(() => reloadMissionsCallback(), [reloadMissionsCallback])

  return (
    <>
      <div className={styles.filtersContainer}>
        <IncButton onClick={() => setShowSimulatorModal(true)}>Simulador</IncButton>
        <IncInput
          showBorder
          type="select"
          options={{
            sent: 'Enviadas',
            received: 'Recibidas',
          }}
          value={sendType}
          onChangeText={setSendType}
        />
        <IncInput
          showBorder
          type="select"
          options={{
            any: 'Cualquier tipo',
            spy: 'Espionajes',
            attack: 'Ataques',
          }}
          value={missionType}
          onChangeText={setMissionType}
        />
        <IncInput
          showBorder
          type="select"
          options={{
            own: 'Propias',
            alliance: 'Alianza',
          }}
          value={ownerType}
          onChangeText={setOwnerType}
        />
        <span>Ataques disponibles: {missions.todaysMissionLimits.attacksLeft}</span>
        <span>
          Recibidas hoy: {missions.todaysMissionLimits.receivedToday}/{missions.todaysMissionLimits.maxDefenses}
        </span>
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
