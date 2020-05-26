import React from 'react'
import PropTypes from 'prop-types'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'

SimulatorResult.propTypes = {
  simulation: PropTypes.object.isRequired,
  targetBuilding: PropTypes.number.isRequired,
  guards: PropTypes.number.isRequired,
  sabots: PropTypes.number.isRequired,
  thieves: PropTypes.number.isRequired,
}
export default function SimulatorResult({ simulation, targetBuilding, guards, sabots, thieves }) {
  const buildingInfo = buildingsList.find(b => b.id === targetBuilding)
  const displayResult =
    simulation.result === 'win'
      ? 'Éxito'
      : simulation.result === 'lose'
      ? 'Fracaso'
      : simulation.result === 'draw'
      ? 'Empate'
      : simulation.result || '???'

  const attackedBuildingName = buildingInfo?.name || '???'

  const killedGuards = guards - simulation.survivingGuards
  const killedSabots = sabots - simulation.survivingSabots
  const killedThieves = thieves - simulation.survivingThieves

  return (
    <>
      <h3>{displayResult}</h3>
      <div>
        Acabarías con {killedGuards.toLocaleString()} guardias, y {simulation.destroyedBuildings} {attackedBuildingName}{' '}
        (máximo {buildingInfo.maximumDestroyedBuildings}).
      </div>
      <br />
      <table>
        <thead>
          <tr>
            <th>Tropas aliadas</th>
          </tr>
          <tr>
            <th>Unidad</th>
            <th>Enviadas</th>
            <th>Bajas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{PERSONNEL_OBJ.sabots.name}</td>
            <td>{sabots.toLocaleString()}</td>
            <td>{killedSabots.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Ladrones</td>
            <td>{thieves.toLocaleString()}</td>
            <td>{killedThieves.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <table>
        <thead>
          <tr>
            <th>Beneficios</th>
          </tr>
          <tr>
            <th>Concepto</th>
            <th>Ganancia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Por destruir edificios</td>
            <td>{simulation.incomeForDestroyedBuildings.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Por bajas enemigas</td>
            <td>{simulation.incomeForKilledTroops.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Por robo</td>
            <td>{simulation.robbedMoney.toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <b>Beneficios netos</b>
            </td>
            <td>{simulation.realAttackerProfit.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
