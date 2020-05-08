import React, { useState, useEffect, useCallback } from 'react'
import api from 'lib/api'
import styles from './Reports.module.scss'
import IncContainer from 'components/UI/inc-container'
import MissionRow from 'components/reports/mission-row/mission-row'
import SimulatorModal from 'components/simulator-modal/simulator-modal'
import IncButton from 'components/UI/inc-button'

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
        setMissions(res)
      })
      .catch(err => alert(err.message))
  }, [missionType, ownerType, sendType])

  useEffect(() => reloadMissionsCallback(), [reloadMissionsCallback])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
        <IncButton onClick={() => setShowSimulatorModal(true)}>Simulador</IncButton>
        <SimulatorModal isOpen={showSimulatorModal} onRequestClose={() => setShowSimulatorModal(false)} />
        <span>Ataques disponibles: {missions.todaysMissionLimits.attacksLeft}</span>
        <span>
          Recibidas hoy: {missions.todaysMissionLimits.receivedToday}/{missions.todaysMissionLimits.maxDefenses}
        </span>
      </div>
      <div style={{ marginBottom: 10 }}>
        <select value={sendType} onChange={e => setSendType(e.target.value)}>
          <option value="sent">Enviadas{missions.notSeenSentCount ? ` (${missions.notSeenSentCount})` : ''}</option>
          <option value="received">
            Recibidas{missions.notSeenReceivedCount ? ` (${missions.notSeenReceivedCount})` : ''}
          </option>
        </select>{' '}
        <select value={missionType} onChange={e => setMissionType(e.target.value)}>
          <option value="any">Cualquier tipo</option>
          <option value="spy">Espionajes</option>
          <option value="attack">Ataques</option>
        </select>{' '}
        <select value={ownerType} onChange={e => setOwnerType(e.target.value)}>
          <option value="own">Propias</option>
          <option value="alliance">Alianza</option>
        </select>
      </div>

      <IncContainer darkBg>
        <div className={styles.missionContainer}>
          {missions.missions.length ? (
            missions.missions.map((mission, index) => (
              <MissionRow
                key={index}
                mission={mission}
                reloadMissionsCallback={reloadMissionsCallback}
                showcaseUser={sendType === 'received' ? 'sender' : 'target'}
              />
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
    </div>
  )
}
