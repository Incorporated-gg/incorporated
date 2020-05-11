import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import IncButton from 'components/UI/inc-button'
import IncInput from 'components/UI/inc-input/inc-input'

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

  const buildingsOptionsObj = {}
  buildingsList.forEach(building => {
    buildingsOptionsObj[building.id] = building.name
  })

  return (
    <>
      <div>{hood ? <span>Barrio a atacar: {hood.name}</span> : <span>Usuario a atacar: {user.username}</span>}</div>
      <div>Tiempo de mision: {missionSeconds}s</div>
      <br />
      <div>
        <label>
          {PERSONNEL_OBJ.sabots.name}
          {': '}
          <IncInput
            showBorder
            min={0}
            max={userData.personnel.sabots}
            type="number"
            value={numSabots}
            onChangeText={setNumSabots}
          />
        </label>
      </div>
      <br />
      <div>
        <label>
          {PERSONNEL_OBJ.thieves.name}
          {': '}
          <IncInput
            showBorder
            min={0}
            max={userData.personnel.thieves}
            type="number"
            value={numThieves}
            onChangeText={setNumThieves}
          />
        </label>
      </div>
      <br />
      <div>
        {user && (
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
        )}
      </div>
      <br />
      <IncButton onClick={startMission}>Enviar</IncButton>
    </>
  )
}
