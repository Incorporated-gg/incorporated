import React, { useState, useEffect } from 'react'
import { useUserData } from 'lib/user'
import { buildingsList, calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import { simulateAttack } from 'shared-lib/simulateAttack'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import SimulatorResult from './simulator-result'
import IncInput from 'components/UI/inc-input/inc-input'
import MissionModalAttack from 'components/mission-modal/components/mission-modal-attack'

const buildingsOptionsObj = {}
buildingsList.forEach(building => {
  buildingsOptionsObj[building.id] = building.name
})

SimulatorModal.propTypes = {
  spyReport: PropTypes.object,
  targetUser: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function SimulatorModal({ spyReport, targetUser, isOpen, onRequestClose }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen &&
        (spyReport ? (
          <SimulatorWithSpyReport targetUser={targetUser} spyReport={spyReport} onRequestClose={onRequestClose} />
        ) : (
          <SimulatorFromScratch />
        ))}
    </Modal>
  )
}

SimulatorWithSpyReport.propTypes = {
  targetUser: PropTypes.object,
  spyReport: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
}
function SimulatorWithSpyReport({ spyReport, targetUser, onRequestClose }) {
  const userData = useUserData()
  const defensorDefenseLvl = spyReport.researchs[3]
  const bankResearchLvl = spyReport.researchs[4]
  const defensorSecurityLvl = spyReport.researchs[6]
  const attackerSabotageLvl = userData.researchs[2]
  const guards = spyReport.personnel.guards

  return (
    <IncContainer darkBg>
      <div style={{ padding: 10 }}>
        <MissionModalAttack
          user={targetUser}
          onRequestClose={onRequestClose}
          simulationFn={({ numSabots, numThieves, targetBuilding }) => {
            const buildingAmount = spyReport.buildings[targetBuilding]?.quantity
            const storedMoney = spyReport.buildings[targetBuilding]?.money

            const maxMoney = calcBuildingMaxMoney({
              buildingID: targetBuilding,
              buildingAmount,
              bankResearchLevel: bankResearchLvl,
            })
            const unprotectedMoney = Math.max(0, storedMoney - maxMoney.maxSafe)

            const simulation = simulateAttack({
              defensorGuards: guards,
              attackerSabots: numSabots,
              attackerThieves: numThieves,
              defensorDefenseLvl,
              attackerSabotageLvl,
              buildingID: targetBuilding,
              defensorSecurityLvl,
              buildingAmount,
              unprotectedMoney,
            })
            return (
              <>
                <SimulatorResult
                  simulation={simulation}
                  targetBuilding={targetBuilding}
                  guards={guards}
                  sabots={numSabots}
                  thieves={numThieves}
                />
                <br />
              </>
            )
          }}
        />
      </div>
    </IncContainer>
  )
}

function SimulatorFromScratch() {
  const userData = useUserData()
  const [guards, setGuards] = useState(0)
  const [defensorDefenseLvl, setDefensorDefenseLvl] = useState(1)
  const [attackerSabotageLvl, setAttackerSabotageLvl] = useState(userData.researchs[2])
  const [defensorSecurityLvl, setDefensorSecurityLvl] = useState(1)
  const [bankResearchLvl, setBankResearchLvl] = useState(1)
  const [buildingAmount, setBuildingAmount] = useState(0)
  const [storedMoney, setStoredMoney] = useState(0)
  const [attackerSabots, setAttackerSabots] = useState(userData.personnel.sabots)
  const [attackerThieves, setAttackerThieves] = useState(userData.personnel.thieves)
  const [targetBuilding, setTargetBuilding] = useState(1)

  useEffect(() => {
    setAttackerSabots(userData.personnel.sabots)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const missionSeconds = calculateMissionTime('attack')

  const maxMoney = calcBuildingMaxMoney({
    buildingID: targetBuilding,
    buildingAmount,
    bankResearchLevel: bankResearchLvl,
  })
  const unprotectedMoney = Math.max(0, storedMoney - maxMoney.maxSafe)

  let simulation
  try {
    simulation = simulateAttack({
      defensorGuards: guards,
      attackerSabots,
      attackerThieves,
      defensorDefenseLvl,
      attackerSabotageLvl,
      defensorSecurityLvl,
      buildingID: targetBuilding,
      buildingAmount,
      unprotectedMoney,
    })
  } catch (e) {
    console.error(e)
    return (
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>{JSON.stringify(e.message)}</div>
      </IncContainer>
    )
  }

  return (
    <IncContainer darkBg>
      <div style={{ padding: 10 }}>
        <div>
          <label>
            {PERSONNEL_OBJ.sabots.name}
            {': '}
            <IncInput showBorder type="number" value={attackerSabots} onChangeText={setAttackerSabots} />
          </label>
        </div>
        <div>
          <label>
            {PERSONNEL_OBJ.thieves.name}
            {': '}
            <IncInput showBorder type="number" value={attackerThieves} onChangeText={setAttackerThieves} />
          </label>
        </div>
        <div>
          <label>
            Nivel Ataque
            {': '}
            <IncInput showBorder type="number" value={attackerSabotageLvl} onChangeText={setAttackerSabotageLvl} />
          </label>
        </div>
        <label>
          <span>Edificio: </span>
          <IncInput
            showBorder
            type="select"
            options={buildingsOptionsObj}
            value={targetBuilding}
            onChangeText={bID => setTargetBuilding(parseInt(bID))}
          />
        </label>
        <div>
          <label>
            Guardias
            {': '}
            <IncInput showBorder type="number" value={guards} onChangeText={setGuards} />
          </label>
        </div>
        <div>
          <label>
            Nivel Defensa
            {': '}
            <IncInput showBorder type="number" value={defensorDefenseLvl} onChangeText={setDefensorDefenseLvl} />
          </label>
        </div>
        <div>
          <label>
            Nivel Seguridad
            {': '}
            <IncInput showBorder type="number" value={defensorSecurityLvl} onChangeText={setDefensorSecurityLvl} />
          </label>
        </div>
        <div>
          <label>
            Nivel Banco
            {': '}
            <IncInput showBorder type="number" value={bankResearchLvl} onChangeText={setBankResearchLvl} />
          </label>
        </div>
        <div>
          <label>
            Cantidad de edificios
            {': '}
            <IncInput showBorder type="number" value={buildingAmount} onChangeText={setBuildingAmount} />
          </label>
        </div>
        <div>
          <label>
            Dinero almacenado
            {': '}
            <IncInput showBorder type="number" value={storedMoney} onChangeText={setStoredMoney} />
          </label>
        </div>
        <div>Tiempo de mision: {missionSeconds}s</div>
        <br />
        <br />
        <SimulatorResult
          simulation={simulation}
          targetBuilding={targetBuilding}
          guards={guards}
          sabots={attackerSabots}
          thieves={attackerThieves}
        />
      </div>
    </IncContainer>
  )
}
