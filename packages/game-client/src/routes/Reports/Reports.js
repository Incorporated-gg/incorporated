import React, { useState, useEffect, useCallback } from 'react'
import api from 'lib/api'
import MissionRow from './MissionRow'
import styles from './Reports.module.scss'
import MissionModal from 'components/mission-modal'
import { Link, useLocation } from 'react-router-dom'
import Container from 'components/UI/container'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function Reports() {
  const query = useQuery()

  const [missions, setMissions] = useState({
    sent: [],
    received: [],
    receivedToday: 0,
    sentToday: 0,
    maxAttacks: 0,
    maxDefenses: 0,
    lastCheckedReportsAt: 0,
  })

  const reloadMissionsCallback = useCallback(() => {
    api
      .get('/v1/missions')
      .then(res => {
        setMissions(res.missions)
      })
      .catch(err => alert(err.message))
  }, [])

  useEffect(() => reloadMissionsCallback(), [reloadMissionsCallback])

  const [showSimulatorModal, setShowSimulatorModal] = useState(false)

  const notSeenReceivedCount = missions.received.filter(
    mission => mission.completed && mission.will_finish_at > missions.lastCheckedReportsAt
  ).length
  const notSeenSentCount = missions.sent.filter(
    mission => mission.completed && mission.will_finish_at > missions.lastCheckedReportsAt
  ).length

  // Figure out what type to display
  const queryType = query.get('type')
  const initialType = notSeenReceivedCount > 0 ? 'received' : 'sent'
  const type = queryType === 'sent' ? 'sent' : queryType === 'received' ? 'received' : initialType

  return (
    <div>
      <Link to="/reports?type=sent">
        <button style={{ color: type === 'sent' ? '#EAC953' : '' }}>
          Enviados {notSeenSentCount ? `(${notSeenSentCount})` : ''}
        </button>
      </Link>
      <Link to="/reports?type=received">
        <button style={{ color: type === 'received' ? '#EAC953' : '' }}>
          Recibidos {notSeenReceivedCount ? `(${notSeenReceivedCount})` : ''}
        </button>
      </Link>
      <button onClick={() => setShowSimulatorModal(true)}>Simulador</button>
      <MissionModal
        missionType="simulate"
        isOpen={showSimulatorModal}
        onRequestClose={() => setShowSimulatorModal(false)}
      />

      <Container darkBg>
        <div className={styles.missionContainer}>
          <h2>
            {type === 'sent'
              ? `Misiones enviadas (Hoy: ${missions.sentToday}/${missions.maxAttacks})`
              : `Misiones recibidas (Hoy: ${missions.receivedToday}/${missions.maxDefenses})`}
          </h2>
          <table>
            <thead>
              <tr>
                <th>Tipo de misión</th>
                <th>{type === 'sent' ? 'Objetivo' : 'Agresor'}</th>
                <th>Fecha</th>
                <th>Resultado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {type === 'sent' &&
                (missions.sent.filter(m => m.completed).length ? (
                  missions.sent
                    .filter(m => m.completed)
                    .map((m, i) => <MissionRow key={i} mission={m} reloadMissionsCallback={reloadMissionsCallback} />)
                ) : (
                  <tr>
                    <td colSpan="3">No has realizado ninguna misión todavía</td>
                  </tr>
                ))}
              {type === 'received' &&
                (missions.received.filter(m => m.completed).length ? (
                  missions.received
                    .filter(m => m.completed)
                    .map((m, i) => (
                      <MissionRow
                        key={i}
                        mission={m}
                        reloadMissionsCallback={reloadMissionsCallback}
                        showcaseUser="sender"
                      />
                    ))
                ) : (
                  <tr>
                    <td colSpan="3">No has recibido ninguna misión todavía</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  )
}
