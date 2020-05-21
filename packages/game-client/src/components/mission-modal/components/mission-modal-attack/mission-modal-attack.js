import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { getTimeUntil } from 'lib/utils'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import IncButton from 'components/UI/inc-button'
import IncInput from 'components/UI/inc-input/inc-input'
import missionModalStyles from '../../mission-modal.module.scss'
import IncContainer from 'components/UI/inc-container'
import Icon from 'components/icon'
import IncProgressBar from 'components/UI/inc-progress-bar'

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
      <div className={missionModalStyles.title}>
        Atacar {hood ? <span>{hood.name}</span> : <span>A {user.username}</span>}
      </div>

      <IncContainer>
        <label className={missionModalStyles.inputLabel}>
          <div>{PERSONNEL_OBJ.sabots.name}</div>
          <IncInput
            min={0}
            max={userData.personnel.sabots}
            type="number"
            value={numSabots}
            onChangeText={setNumSabots}
          />
        </label>
      </IncContainer>

      <br />

      <IncContainer>
        <label className={missionModalStyles.inputLabel}>
          <div>{PERSONNEL_OBJ.thieves.name}</div>
          <IncInput
            min={0}
            max={userData.personnel.thieves}
            type="number"
            value={numThieves}
            onChangeText={setNumThieves}
          />
        </label>
      </IncContainer>

      <br />

      {user && (
        <IncContainer>
          <label className={missionModalStyles.inputLabel}>
            <div>Edificio</div>
            <IncInput
              type="select"
              options={buildingsOptionsObj}
              value={targetBuilding}
              onChangeText={bID => setTargetBuilding(parseInt(bID))}
            />
          </label>
        </IncContainer>
      )}

      <br />

      <IncButton outerStyle={{ width: '100%' }} onClick={startMission}>
        <div className={missionModalStyles.sendButtonTimer}>
          <div>{getTimeUntil(Date.now() / 1000 + missionSeconds, true)}</div>
          <IncProgressBar direction="horizontal" color="red" progressPercentage={100} />
        </div>
        <div className={missionModalStyles.sendButtonTitle}>
          ATACAR <Icon iconName="dynamite_stack" size={30} />
        </div>
      </IncButton>
    </>
  )
}
