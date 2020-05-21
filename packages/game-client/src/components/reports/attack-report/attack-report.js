import React from 'react'
import PropTypes from 'prop-types'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import UserLink from 'components/UI/user-link'
import NotepadPage from 'components/UI/notepad-page'

AttackReport.propTypes = {
  mission: PropTypes.object.isRequired,
}
export default function AttackReport({ mission }) {
  const buildingInfo = buildingsList.find(b => b.id === mission.target_building)
  const displayResult =
    mission.result === 'win'
      ? 'Éxito'
      : mission.result === 'lose'
      ? 'Fracaso'
      : mission.result === 'draw'
      ? 'Empate'
      : mission.result || '???'

  const targetElm = mission.target_hood ? (
    <span>{mission.target_hood.name}</span>
  ) : (
    <UserLink colorScheme="dark" user={mission.target_user} />
  )

  const attackedBuildingName = buildingInfo?.name || '???'

  const summaryElm = mission.target_user ? (
    mission.result === 'win' ? (
      <>
        El ataque a {targetElm} ha sido todo un éxito. Has acabado con {mission.report.killed_guards.toLocaleString()}{' '}
        guardias, y {mission.report.destroyed_buildings} {attackedBuildingName}.
      </>
    ) : mission.result === 'lose' ? (
      <>
        El ataque a {targetElm} ha sido un fracaso total. Has acabado con{' '}
        {mission.report.killed_guards.toLocaleString()} guardias, pero 0 {attackedBuildingName}.
      </>
    ) : mission.result === 'draw' ? (
      <>
        El ataque a {targetElm} no ha salido como planeábamos. Has acabado con{' '}
        {mission.report.killed_guards.toLocaleString()} guardias, pero 0 {attackedBuildingName}.
      </>
    ) : (
      <>???</>
    )
  ) : mission.target_hood ? (
    mission.result === 'win' ? (
      <>
        El ataque a {targetElm} ha sido todo un éxito. Has acabado con {mission.report.killed_guards.toLocaleString()}{' '}
        guardias, y conquistado el barrio
      </>
    ) : mission.result === 'lose' ? (
      <>
        El ataque a {targetElm} ha sido un fracaso total. Has acabado con{' '}
        {mission.report.killed_guards.toLocaleString()} guardias, pero no has podido conquistar el barrio
      </>
    ) : (
      <>???</>
    )
  ) : (
    <>???</>
  )

  return (
    <NotepadPage>
      <div>{timestampFromEpoch(mission.will_finish_at)}</div>
      <div>
        <UserLink colorScheme="dark" user={mission.user} /> VS {targetElm}
      </div>
      <h1>¡{displayResult}!</h1>
      <div>{summaryElm}</div>
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
            <td>{mission.sent_sabots.toLocaleString()}</td>
            <td>{mission.report.killed_sabots.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Ladrones</td>
            <td>{mission.sent_thieves.toLocaleString()}</td>
            <td>{mission.report.killed_thieves.toLocaleString()}</td>
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
            <td>{mission.report.income_from_buildings.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Por bajas enemigas</td>
            <td>{mission.report.income_from_troops.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Por robo</td>
            <td>{mission.report.income_from_robbed_money.toLocaleString()}</td>
          </tr>
          {mission.report.income_from_conquering_hood && (
            <tr>
              <td>Por conquista de barrio</td>
              <td>{mission.report.income_from_conquering_hood.toLocaleString()}</td>
            </tr>
          )}
          <tr>
            <td>Por bajas aliadas</td>
            <td>
              {(-(
                mission.report.killed_sabots * PERSONNEL_OBJ.sabots.price +
                mission.report.killed_thieves * PERSONNEL_OBJ.thieves.price
              )).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td>
              <b>Beneficios netos</b>
            </td>
            <td>{mission.profit.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </NotepadPage>
  )
}
