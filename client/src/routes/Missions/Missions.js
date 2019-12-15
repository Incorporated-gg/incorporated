import React, { useState, useEffect, useCallback } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import api from '../../lib/api'
import './Missions.scss'
import Mission from './Mission'
import MissionRow from './MissionRow'

export default function Missions() {
  const [missions, setMissions] = useState([])
  const activeMissions = missions.filter(m => !m.completed)

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
            <NavLink to="/missions">Atacar</NavLink>
          </li>
          <li>
            <NavLink to="/missions/hack">Hackear</NavLink>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/missions/:missionType?/:username?">
          <Mission reloadMissionsCallback={reloadMissionsCallback} />
        </Route>
      </Switch>
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
      <hr />
      <h2>Completed missions</h2>
      <table>
        <thead>
          <tr>
            <th>Tipo de misión</th>
            <th>Usuario objetivo</th>
            <th>Fecha</th>
            <th>Resultado</th>
            <th>Bºs</th>
          </tr>
        </thead>
        <tbody>
          {missions.filter(m => m.completed).length ? (
            missions
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
  )
}
