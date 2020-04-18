import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { userData } from 'lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { personnelObj } from 'shared-lib/personnelUtils'
import { researchList } from 'shared-lib/researchUtils'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import UserLink from 'components/UI/UserLink'
import NotepadPage from 'components/UI/NotepadPage'
import Icon from 'components/icon'
import { numberToAbbreviation } from 'lib/utils'
import IncButton from 'components/UI/inc-button'
import SimulatorModal from 'components/simulator-modal/simulator-modal'

SpyReport.propTypes = {
  mission: PropTypes.object.isRequired,
}
export default function SpyReport({ mission }) {
  const isTargetMe = mission.target_user && userData.id === mission.target_user.id
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false)

  if (isTargetMe) {
    return (
      <NotepadPage>
        Hemos cazado a {mission.report.captured_spies.toLocaleString()} espías de{' '}
        <UserLink colorScheme="dark" user={mission.user} /> que nos intentaban robar información confidencial!
      </NotepadPage>
    )
  }

  return (
    <NotepadPage>
      <div>{timestampFromEpoch(mission.will_finish_at)}</div>
      <div>
        <b>Espías enviados:</b> {mission.sent_spies}
      </div>
      {mission.report.captured_spies > 0 && (
        <div>
          Durante la misión el enemigo fue alertado, y capturaron a {mission.report.captured_spies.toLocaleString()} de
          nuestros espías. Quizás deberíamos haber mandado menos espías, o invertido más en la investigación de
          espionaje.
        </div>
      )}
      {mission.report.buildings && (
        <div>
          <br />
          <table>
            <thead>
              <tr>
                <th>Edificio</th>
                <th>Cantidad</th>
                <th>Dinero almacenado</th>
              </tr>
            </thead>
            <tbody>
              {buildingsList.map(buildingInfo => {
                const building = mission.report.buildings[buildingInfo.id]
                return (
                  <tr key={buildingInfo.id}>
                    <td>{buildingInfo.name}</td>
                    <td>{building.quantity.toLocaleString()}</td>
                    <td>
                      {numberToAbbreviation(building.money)} <Icon iconName="money" size={16} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {mission.report.personnel && (
        <div>
          <br />
          <b>{'Personal'}:</b>
          {Object.values(personnelObj).map(personnelInfo => {
            return (
              <div key={personnelInfo.resource_id}>
                {personnelInfo.name}: {mission.report.personnel[personnelInfo.resource_id]}
              </div>
            )
          })}
        </div>
      )}
      {mission.report.researchs && (
        <div>
          <br />
          <b>{'Investigaciones'}:</b>
          {researchList.map(researchInfo => {
            return (
              <div key={researchInfo.id}>
                {researchInfo.name}: Nivel {mission.report.researchs[researchInfo.id]}
              </div>
            )
          })}
          <br />
          <IncButton
            onClick={() => {
              setIsSimulatorModalOpen(true)
            }}>
            Simular ataque
          </IncButton>
          <SimulatorModal
            spyReport={mission.report}
            isOpen={isSimulatorModalOpen}
            onRequestClose={() => {
              setIsSimulatorModalOpen(false)
            }}
          />
        </div>
      )}
      {!mission.report.buildings &&
        (mission.report.captured_spies === 0 ? (
          <div>
            <br />
            No hemos obtenido ninguna información! Tendremos que enviar más espías
          </div>
        ) : (
          <div>
            <br />
            No hemos obtenido ninguna información! Nos han capturado a demasiados espías
          </div>
        ))}
    </NotepadPage>
  )
}
