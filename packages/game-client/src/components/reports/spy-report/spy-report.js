import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { userData } from 'lib/user'
import { buildingsList, calcBuildingMaxMoney, getBuildingDestroyedProfit } from 'shared-lib/buildingsUtils'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import { researchList } from 'shared-lib/researchUtils'
import { timestampFromEpoch } from 'shared-lib/commonUtils'
import UserLink from 'components/UI/user-link'
import NotepadPage from 'components/UI/notepad-page'
import Icon from 'components/icon'
import { numberToAbbreviation } from 'lib/utils'
import IncButton from 'components/UI/inc-button'
import SimulatorModal from 'components/simulator-modal/simulator-modal'
import UserActionButtons from 'components/UI/user-action-buttons/user-action-buttons'

SpyReport.propTypes = {
  mission: PropTypes.object.isRequired,
}
export default function SpyReport({ mission }) {
  const isTargetMe = mission.target_user && userData.id === mission.target_user.id
  const canSimulateAttack = mission.report.researchs?.[5] !== undefined
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false)
  if (!mission.report.researchs) return null // Old spy reports format. Can be deleted by Dec 2020

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
      <div>
        <br />
        <table>
          <thead>
            <tr>
              <th>Edificio</th>
              <th>Cantidad</th>
              <th>Destrucción</th>
              <th>Robo</th>
            </tr>
          </thead>
          <tbody>
            {buildingsList.map(buildingInfo => {
              const reportBuilding = mission.report.buildings[buildingInfo.id]
              const buildingAmount = reportBuilding ? reportBuilding.quantity : '?'
              let robbableMoney = '?'
              if (mission.report.researchs[4] !== undefined) {
                const bankResearchLevel = mission.report.researchs[4]
                robbableMoney =
                  reportBuilding.money -
                  calcBuildingMaxMoney({ buildingID: buildingInfo.id, buildingAmount, bankResearchLevel }).maxSafe

                robbableMoney = robbableMoney <= 0 ? 0 : numberToAbbreviation(robbableMoney)
              }

              const incomeForDestroyedBuildings = !reportBuilding
                ? '?'
                : numberToAbbreviation(
                    getBuildingDestroyedProfit({
                      buildingID: buildingInfo.id,
                      buildingAmount,
                      destroyedBuildings: Math.min(buildingAmount, buildingInfo.maximumDestroyedBuildings),
                    })
                  )

              return (
                <tr key={buildingInfo.id}>
                  <td>{buildingInfo.name}</td>
                  <td>{buildingAmount.toLocaleString()}</td>
                  <td>
                    {incomeForDestroyedBuildings} <Icon iconName="money" size={16} />
                  </td>
                  <td>
                    {robbableMoney} <Icon iconName="money" size={16} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div>
        <br />
        <b>{'Personal'}:</b>
        {Object.values(PERSONNEL_OBJ).map(personnelInfo => {
          const reportPersonnel = mission.report.personnel[personnelInfo.resource_id]
          const quantity = reportPersonnel !== undefined ? reportPersonnel.toLocaleString() : '?'
          return (
            <div key={personnelInfo.resource_id}>
              {personnelInfo.name}: {quantity}
            </div>
          )
        })}
      </div>
      <div>
        <br />
        <b>{'Investigaciones'}:</b>
        {researchList.map(researchInfo => {
          const reportResearch = mission.report.researchs[researchInfo.id]
          const level = reportResearch !== undefined ? reportResearch.toLocaleString() : '?'
          return (
            <div key={researchInfo.id}>
              {researchInfo.name}: Nivel {level}
            </div>
          )
        })}
      </div>
      <div>
        <br />
        <b>{'Límites'}:</b>
        <div>Ataques disponibles: {mission.report.dailyLimits?.attacksLeft ?? '?'}</div>
        <div>
          Ataques recibidos hoy: {mission.report.dailyLimits?.receivedToday ?? '?'} /{' '}
          {mission.report.dailyLimits?.maxDefenses}
        </div>
      </div>
      {canSimulateAttack && (
        <>
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
        </>
      )}
      {!mission.report.buildings[1] &&
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
      <UserActionButtons user={mission.target_user} />
    </NotepadPage>
  )
}
