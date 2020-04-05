import React, { useState, useEffect, useCallback } from 'react'
import api from 'lib/api'
import styles from './Reports.module.scss'
import MissionModal from 'components/mission-modal'
import Container from 'components/UI/container'
import MissionRow from 'components/reports/mission-row/mission-row'

const initialMissionsState = {
  missions: [],
  todaysMissionLimits: {
    receivedToday: 0,
    sentToday: 0,
    maxAttacks: 0,
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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setShowSimulatorModal(true)}>Simulador</button>
        <MissionModal
          missionType="simulate"
          isOpen={showSimulatorModal}
          onRequestClose={() => setShowSimulatorModal(false)}
        />
        <span>
          Enviadas hoy: {missions.todaysMissionLimits.sentToday}/{missions.todaysMissionLimits.maxAttacks}
        </span>
        <span>
          Recibidas hoy: {missions.todaysMissionLimits.receivedToday}/{missions.todaysMissionLimits.maxDefenses}
        </span>
      </div>
      <div>
        <select value={sendType} onChange={e => setSendType(e.target.value)}>
          <option value="sent">Enviadas{missions.notSeenSentCount ? ` (${missions.notSeenSentCount})` : ''}</option>
          <option value="received">
            Recibidas{missions.notSeenReceivedCount ? ` (${missions.notSeenReceivedCount})` : ''}
          </option>
        </select>
        <select value={missionType} onChange={e => setMissionType(e.target.value)}>
          <option value="any">Cualquier tipo</option>
          <option value="spy">Espionajes</option>
          <option value="attack">Ataques</option>
        </select>
        <select value={ownerType} onChange={e => setOwnerType(e.target.value)}>
          <option value="own">Propias</option>
          <option value="alliance">Alianza</option>
        </select>
      </div>

      <Container darkBg>
        <div className={styles.missionContainer}>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>{sendType === 'sent' ? 'Objetivo' : 'Agresor'}</th>
                <th>Día</th>
                <th>Resultado</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
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
                <tr>
                  <td colSpan="9999">
                    {sendType === 'sent'
                      ? 'No has realizado ninguna misión todavía'
                      : 'No has recibido ninguna misión todavía'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  )
}
