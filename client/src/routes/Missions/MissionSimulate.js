import React, { useState, useEffect } from 'react'
import { useUserData } from '../../lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { calculateMissionTime, simulateAttack } from 'shared-lib/missionsUtils'

Mission.propTypes = {}
export default function Mission() {
  const userData = useUserData()
  const [guards, setGuards] = useState(0)
  const [resDefense, setResDefense] = useState(1)
  const [resAttack, setResAttack] = useState(1)
  const [resInfra, setResInfra] = useState(1)
  const [buildingsCount, setBuildingsCount] = useState(0)
  const [numTroops, setNumTroops] = useState(() => {
    return userData.personnel.sabots
  })
  const [targetBuilding, setTargetBuilding] = useState(1)

  useEffect(() => {
    setNumTroops(userData.personnel.sabots)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const missionSeconds = calculateMissionTime('attack', numTroops)

  const simulation = simulateAttack({
    defensorGuards: guards,
    attackerSabots: numTroops,
    defensorSecurityLvl: resDefense,
    attackerSabotageLvl: resAttack,
    buildingID: targetBuilding,
    defensorInfraLvl: resInfra,
    defensorNumEdificios: buildingsCount,
  })

  return (
    <form className="startNewMission">
      <div>
        <label>
          Guardias
          {': '}
          <input type="number" value={guards} onChange={e => setGuards(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Saboteadores
          {': '}
          <input type="number" value={numTroops} onChange={e => setNumTroops(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Lvl Defensa
          {': '}
          <input type="number" value={resDefense} onChange={e => setResDefense(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Lvl Ataque
          {': '}
          <input type="number" value={resAttack} onChange={e => setResAttack(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Lvl infra
          {': '}
          <input type="number" value={resInfra} onChange={e => setResInfra(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Num edificios
          {': '}
          <input type="number" value={buildingsCount} onChange={e => setBuildingsCount(e.target.value)} />
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
    </form>
  )
}
