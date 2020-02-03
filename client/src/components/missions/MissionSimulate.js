import React, { useState, useEffect } from 'react'
import { useUserData } from '../../lib/user'
import { buildingsList, calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { calculateMissionTime, simulateAttack } from 'shared-lib/missionsUtils'
import styles from './Missions.module.scss'
import PropTypes from 'prop-types'
import Modal from 'react-modal'

MissionSimulateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionSimulateModal({ isOpen, onRequestClose }) {
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
  const unprotectedMoney = Math.min(Math.max(0, storedMoney - maxMoney.maxSafe), maxMoney.maxRobbedPerAttack)

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
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <form className={styles.startNewMission}>
        <div>
          <label>
            Saboteadores
            {': '}
            <input type="number" value={attackerSabots} onChange={e => setAttackerSabots(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Ladrones
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
      </form>
    </Modal>
  )
}
