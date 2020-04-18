import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { personnelObj } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'

MissionModalAttack.propTypes = {
  user: PropTypes.object,
  hood: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionModalAttack({ user, hood, onRequestClose }) {
  const userData = useUserData()
  const [numSabots, setNumSabots] = useState(userData.personnel.sabots)
  const [numThieves, setNumThieves] = useState(userData.personnel.thieves)
  const [targetBuilding, setTargetBuilding] = useState(1)

  useEffect(() => {
    setNumSabots(userData.personnel.sabots)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const startMission = useCallback(
    e => {
      e.preventDefault()
      const params = {
        mission_type: 'attack',
        sent_sabots: numSabots,
        sent_thieves: numThieves,
      }
      if (user) {
        params.target_user = user?.username
        params.target_building = targetBuilding
      }
      if (hood) {
        params.target_hood = hood.id
      }
      api
        .post('/v1/missions/create', params)
        .then(() => {
          onRequestClose()
        })
        .catch(error => alert(error))
    },
    [hood, numSabots, numThieves, onRequestClose, targetBuilding, user]
  )

  const missionSeconds = calculateMissionTime('attack')

  return (
    <>
      <div>{hood ? <span>Barrio a atacar: {hood.name}</span> : <span>Usuario a atacar: {user.username}</span>}</div>
      <div>Tiempo de mision: {missionSeconds}s</div>
      <div>
        <label>
          {personnelObj.sabots.name}
          {': '}
          <input type="number" name="quantity" value={numSabots} onChange={e => setNumSabots(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          {personnelObj.thieves.name}
          {': '}
          <input type="number" name="quantity" value={numThieves} onChange={e => setNumThieves(e.target.value)} />
        </label>
      </div>
      <div>
        {user && (
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
        )}
      </div>
      <div>
        <button onClick={startMission}>Enviar</button>
      </div>
    </>
  )
}
