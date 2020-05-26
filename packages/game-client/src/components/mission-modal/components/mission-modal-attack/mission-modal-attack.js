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
import styles from './mission-modal-attack.module.scss'
import IncContainer from 'components/UI/inc-container'
import Icon from 'components/icon'
import IncProgressBar from 'components/UI/inc-progress-bar'
import TroopRangeInput from '../troop-range-input/troop-range-input'

MissionModalAttack.propTypes = {
  user: PropTypes.object,
  hood: PropTypes.object,
  simulationFn: PropTypes.func,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionModalAttack({ user, hood, simulationFn, onRequestClose }) {
  const userData = useUserData()
  const [numSabots, setNumSabots] = useState(userData.personnel.sabots)
  const [numThieves, setNumThieves] = useState(userData.personnel.thieves)
  const [targetBuilding, setTargetBuilding] = useState(1)
  const [rebuyLostTroops, setRebuyLostTroops] = useState(true)

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
        rebuy_lost_troops: rebuyLostTroops,
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
    [hood, numSabots, numThieves, onRequestClose, rebuyLostTroops, targetBuilding, user]
  )

  const missionSeconds = calculateMissionTime('attack')

  const buildingsOptionsObj = {}
  buildingsList.forEach(building => {
    buildingsOptionsObj[building.id] = building.name
  })

  const maxSabots = userData.personnel.sabots + (userData.allianceResources?.sabots || 0)
  const maxThieves = userData.personnel.thieves + (userData.allianceResources?.thieves || 0)

  return (
    <>
      <div className={missionModalStyles.title}>
        Atacar {hood ? <span>{hood.name}</span> : <span>A {user.username}</span>}
      </div>

      <TroopRangeInput name={PERSONNEL_OBJ.sabots.name} value={numSabots} max={maxSabots} setValue={setNumSabots} />
      <br />

      <TroopRangeInput name={PERSONNEL_OBJ.thieves.name} value={numThieves} max={maxThieves} setValue={setNumThieves} />
      <br />

      {user && (
        <>
          <IncContainer>
            <label className={styles.buildingInputLabel}>
              <div>Edificio</div>
              <IncInput
                type="select"
                options={buildingsOptionsObj}
                value={targetBuilding}
                onChangeText={bID => setTargetBuilding(parseInt(bID))}
              />
            </label>
          </IncContainer>
          <div style={{ marginTop: 10 }}>
            <label>
              Reponer personal perdido:{' '}
              <span style={{ verticalAlign: 'middle' }}>
                <IncInput type="checkbox" value={rebuyLostTroops} onChangeText={setRebuyLostTroops} />
              </span>
            </label>
          </div>
        </>
      )}

      <br />
      {simulationFn && simulationFn({ numSabots, numThieves, targetBuilding })}

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
