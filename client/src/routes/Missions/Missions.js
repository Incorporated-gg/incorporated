import React, { useState, useEffect, useCallback } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import api from '../../lib/api'
import Mission from './Mission'
import MissionRow from './MissionRow'
import styles from './Missions.module.scss'

export default function Missions() {
  const [missions, setMissions] = useState({
    sent: [],
    received: [],
    receivedToday: 0,
    sentToday: 0,
    maxAttacks: 0,
    maxDefenses: 0,
  })
  const activeMissions = missions.sent.filter(m => !m.completed)

  const reloadMissionsCallback = useCallback(() => {
    api
      .get('/v1/missions')
      .then(res => {
        setMissions(res.missions)
      })
      .catch(err => alert(err.message))
  }, [])

  useEffect(() => reloadMissionsCallback(), [reloadMissionsCallback])

  return (
    <div>
      <nav className="sub-menu">
        <ul>
          <li>
            <NavLink to="/missions/attack">Atacar</NavLink>
          </li>
          <li>
            <NavLink to="/missions/spy">Espiar</NavLink>
          </li>
          <li>
            <NavLink to="/missions/simulator">Simulador</NavLink>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/missions/:missionType/:username?">
          <Mission reloadMissionsCallback={reloadMissionsCallback} />
        </Route>
      </Switch>

      <div className={styles.container}>
        <h2>Active missions</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo de misión</th>
              <th>Usuario objetivo</th>
              <th>Tropas enviadas</th>
              <th>Edificio objetivo</th>
              <th>Fecha de finalización</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activeMissions.length ? (
              activeMissions.map((mission, i) => (
                <MissionRow key={i} mission={mission} reloadMissionsCallback={reloadMissionsCallback} />
              ))
            ) : (
              <tr>
                <td colSpan="3">No hay misiones activas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.container}>
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
      <div className={styles.container}>
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
