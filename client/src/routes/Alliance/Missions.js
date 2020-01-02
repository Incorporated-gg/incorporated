import React, { useEffect } from 'react'
import MissionRow from '../Missions/MissionRow'
import PropTypes from 'prop-types'
import { NavLink, useParams } from 'react-router-dom'

AllianceMissions.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceMissions({ alliance, reloadAllianceData }) {
  const { missionType } = useParams('missionType') || 'attack'
  const activeMissions = alliance.mission_history.active_missions
  const sentAttackMissions = alliance.mission_history.sent_attack_missions
  const sentSpyMissions = alliance.mission_history.sent_spy_missions
  const receivedAttackMissions = alliance.mission_history.received_attack_missions
  const receivedSpyMissions = alliance.mission_history.received_spy_missions
  let sentMissions, receivedMissions

  switch (missionType) {
    case 'attack':
      sentMissions = sentAttackMissions
      receivedMissions = receivedAttackMissions
      break
    case 'spy':
      sentMissions = sentSpyMissions
      receivedMissions = receivedSpyMissions
      break
    default:
      sentMissions = sentAttackMissions
      receivedMissions = receivedAttackMissions
  }

  useEffect(() => reloadAllianceData(), [reloadAllianceData])

  return (
    <div>
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
              <MissionRow key={i} mission={mission} reloadMissionsCallback={reloadAllianceData} />
            ))
          ) : (
            <tr>
              <td colSpan="3">No hay misiones activas</td>
            </tr>
          )}
        </tbody>
      </table>
      <hr />
      <nav className="sub-menu">
        <ul>
          <li>
            <NavLink to="/alliance/missions" exact>
              Ataques
            </NavLink>
          </li>
          <li>
            <NavLink to="/alliance/missions/spy">Espionajes</NavLink>
          </li>
        </ul>
      </nav>
      <h2>Received missions</h2>
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
          {receivedMissions.length ? (
            receivedMissions.map((m, i) => (
              <MissionRow key={i} mission={m} reloadMissionsCallback={reloadAllianceData} />
            ))
          ) : (
            <tr>
              <td colSpan="3">No has realizado ninguna misión todavía</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>Sent missions</h2>
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
          {sentMissions.length ? (
            sentMissions.map((m, i) => <MissionRow key={i} mission={m} reloadMissionsCallback={reloadAllianceData} />)
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
