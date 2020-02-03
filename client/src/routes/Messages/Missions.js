import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import MissionRow from './MissionRow'
import styles from './Messages.module.scss'
import MissionAttackModal from '../../components/missions/MissionAttack'
import MissionSpyModal from '../../components/missions/MissionSpy'
import MissionSimulateModal from '../../components/missions/MissionSimulate'

export default function Missions() {
  const [missions, setMissions] = useState({
    sent: [],
    received: [],
    receivedToday: 0,
    sentToday: 0,
    maxAttacks: 0,
    maxDefenses: 0,
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

  const [showAttackModal, setShowAttackModal] = useState(false)
  const [showSpyModal, setShowSpyModal] = useState(false)
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)

  return (
    <div>
      <button onClick={() => setShowAttackModal(true)}>Atacar</button>
      <button onClick={() => setShowSpyModal(true)}>Espiar</button>
      <button onClick={() => setShowSimulatorModal(true)}>Simulador</button>
      <MissionAttackModal isOpen={showAttackModal} onRequestClose={() => setShowAttackModal(false)} />
      <MissionSpyModal isOpen={showSpyModal} onRequestClose={() => setShowSpyModal(false)} />
      <MissionSimulateModal isOpen={showSimulatorModal} onRequestClose={() => setShowSimulatorModal(false)} />

      <div className={styles.missionContainer}>
        <h2>
          Completed missions (today: {missions.sentToday}/{missions.maxAttacks})
        </h2>
        <table>
          <thead>
            <tr>
              <th>Tipo de misión</th>
              <th>Usuario objetivo</th>
              <th>Fecha</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {missions.sent.filter(m => m.completed).length ? (
              missions.sent
                .filter(m => m.completed)
                .map((m, i) => <MissionRow key={i} mission={m} reloadMissionsCallback={reloadMissionsCallback} />)
            ) : (
              <tr>
                <td colSpan="3">No has realizado ninguna misión todavía</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.missionContainer}>
        <h2>
          Received (today: {missions.receivedToday}/{missions.maxDefenses})
        </h2>
        <table>
          <thead>
            <tr>
              <th>Tipo de misión</th>
              <th>Usuario objetivo</th>
              <th>Fecha</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {missions.received.filter(m => m.completed).length ? (
              missions.received
                .filter(m => m.completed)
                .map((m, i) => <MissionRow key={i} mission={m} reloadMissionsCallback={reloadMissionsCallback} />)
            ) : (
              <tr>
                <td colSpan="3">No has recibido ninguna misión todavía</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
