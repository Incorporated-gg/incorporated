import React, { useState, useEffect } from 'react'
import { useUserData } from 'lib/user'
import { buildingsList, calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { calculateMissionTime, simulateAttack } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'

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
            <input type="number" value={attackerSabots} onChange={e => setAttackerSabots(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            {PERSONNEL_OBJ.thieves.name}
            {': '}
            <input type="number" value={attackerThieves} onChange={e => setAttackerThieves(e.target.value)} />
          </label>
        </div>
        <label>
          <span>Edificio: </span>
          <select value={targetBuilding} onChange={e => setTargetBuilding(parseInt(e.target.value))}>
            {buildingsList.map(building => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </label>
        <div>Tiempo de mision: {missionSeconds}s</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(simulation, null, 2)}</div>
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
            <input type="number" value={attackerSabots} onChange={e => setAttackerSabots(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            {PERSONNEL_OBJ.thieves.name}
            {': '}
            <input type="number" value={attackerThieves} onChange={e => setAttackerThieves(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Lvl Ataque
            {': '}
            <input type="number" value={attackerSabotageLvl} onChange={e => setAttackerSabotageLvl(e.target.value)} />
          </label>
        </div>
        <label>
          <span>Edificio: </span>
          <select value={targetBuilding} onChange={e => setTargetBuilding(parseInt(e.target.value))}>
            {buildingsList.map(building => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          <label>
            Guardias
            {': '}
            <input type="number" value={guards} onChange={e => setGuards(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Lvl Defensa
            {': '}
            <input type="number" value={defensorSecurityLvl} onChange={e => setDefensorSecurityLvl(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Lvl infra
            {': '}
            <input type="number" value={infraResearchLvl} onChange={e => setInfraResearchLvl(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Lvl banco
            {': '}
            <input type="number" value={bankResearchLvl} onChange={e => setBankResearchLvl(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Num edificios
            {': '}
            <input type="number" value={buildingAmount} onChange={e => setBuildingAmount(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Dinero almacenado en edificio
            {': '}
            <input type="number" value={storedMoney} onChange={e => setStoredMoney(e.target.value)} />
          </label>
        </div>
        <div>Tiempo de mision: {missionSeconds}s</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(simulation, null, 2)}</div>
      </div>
    </IncContainer>
  )
}
