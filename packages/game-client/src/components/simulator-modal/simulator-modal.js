import React, { useState, useEffect } from 'react'
import { useUserData } from 'lib/user'
import { buildingsList, calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { calculateMissionTime, simulateAttack } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import SimulatorResult from './simulator-result'
import IncInput from 'components/UI/inc-input/inc-input'

const buildingsOptionsObj = {}
buildingsList.forEach(building => {
  buildingsOptionsObj[building.id] = building.name
})

SimulatorModal.propTypes = {
  spyReport: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function SimulatorModal({ spyReport, isOpen, onRequestClose }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen && (spyReport ? <SimulatorWithSpyReport spyReport={spyReport} /> : <SimulatorFromScratch />)}
    </Modal>
  )
}

SimulatorWithSpyReport.propTypes = {
  spyReport: PropTypes.object,
}
function SimulatorWithSpyReport({ spyReport }) {
  const userData = useUserData()
  const [attackerSabots, setAttackerSabots] = useState(userData.personnel.sabots)
  const [attackerThieves, setAttackerThieves] = useState(userData.personnel.thieves)
  const [targetBuilding, setTargetBuilding] = useState(1)
  const buildingAmount = spyReport.buildings[targetBuilding]?.quantity
  const storedMoney = spyReport.buildings[targetBuilding]?.money
  const defensorSecurityLvl = spyReport.researchs[3]
  const bankResearchLvl = spyReport.researchs[4]
  const infraResearchLvl = spyReport.researchs[6]
  const attackerSabotageLvl = userData.researchs[2]
  const guards = spyReport.personnel.guards

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

  const simulation = simulateAttack({
    defensorGuards: guards,
    attackerSabots,
    attackerThieves,
    defensorSecurityLvl,
    attackerSabotageLvl,
    buildingID: targetBuilding,
    infraResearchLvl,
    buildingAmount,
    unprotectedMoney,
  })

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
        <div>Tiempo de mision: {missionSeconds}s</div>
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

function SimulatorFromScratch() {
  const userData = useUserData()
  const [guards, setGuards] = useState(0)
  const [defensorSecurityLvl, setDefensorSecurityLvl] = useState(1)
  const [attackerSabotageLvl, setAttackerSabotageLvl] = useState(userData.researchs[2])
  const [infraResearchLvl, setInfraResearchLvl] = useState(1)
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

  const simulation = simulateAttack({
    defensorGuards: guards,
    attackerSabots,
    attackerThieves,
    defensorSecurityLvl,
    attackerSabotageLvl,
    buildingID: targetBuilding,
    infraResearchLvl,
    buildingAmount,
    unprotectedMoney,
  })

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
            Lvl Ataque
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
            Lvl Defensa
            {': '}
            <IncInput showBorder type="number" value={defensorSecurityLvl} onChangeText={setDefensorSecurityLvl} />
          </label>
        </div>
        <div>
          <label>
            Lvl infra
            {': '}
            <IncInput showBorder type="number" value={infraResearchLvl} onChangeText={setInfraResearchLvl} />
          </label>
        </div>
        <div>
          <label>
            Lvl banco
            {': '}
            <IncInput showBorder type="number" value={bankResearchLvl} onChangeText={setBankResearchLvl} />
          </label>
        </div>
        <div>
          <label>
            Num edificios
            {': '}
            <IncInput showBorder type="number" value={buildingAmount} onChangeText={setBuildingAmount} />
          </label>
        </div>
        <div>
          <label>
            Dinero almacenado en edificio
            {': '}
            <IncInput showBorder type="number" value={storedMoney} onChangeText={setStoredMoney} />
          </label>
        </div>
        <div>Tiempo de mision: {missionSeconds}s</div>
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
