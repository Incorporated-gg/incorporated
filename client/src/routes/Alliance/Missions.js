import React, { useEffect } from 'react'
import MissionRow from '../Missions/MissionRow'
import PropTypes from 'prop-types'

AllianceMissions.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceMissions({ alliance, reloadAllianceData }) {
  const missions = alliance.missions
  const activeMissions = missions.filter(m => !m.completed)

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
              .map((m, i) => <MissionRow key={i} mission={m} reloadMissionsCallback={reloadAllianceData} />)
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
