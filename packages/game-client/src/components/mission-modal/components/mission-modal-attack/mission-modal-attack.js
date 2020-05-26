import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { getTimeUntil, numberToAbbreviation } from 'lib/utils'
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

  const corpSabots = Math.max(0, numSabots - userData.personnel.sabots)
  const ownSabots = numSabots - corpSabots
  const corpThieves = Math.max(0, numThieves - userData.personnel.thieves)
  const ownThieves = numThieves - corpThieves

  const maxSabots = userData.personnel.sabots + (userData.allianceResources?.sabots || 0)
  const maxThieves = userData.personnel.thieves + (userData.allianceResources?.thieves || 0)
  const sabotsButtonNum = Math.max(1, Math.round(numSabots / 100))
  const thievesButtonNum = Math.max(1, Math.round(numThieves / 100))
  const adjustmentButton = (curr, set, diff, max) => {
    set(Math.min(max, Math.max(0, curr + diff)))
  }

  return (
    <>
      <div className={missionModalStyles.title}>
        Atacar {hood ? <span>{hood.name}</span> : <span>A {user.username}</span>}
      </div>

      <IncContainer>
        <div className={missionModalStyles.inputLabel}>
          <div>{PERSONNEL_OBJ.sabots.name}</div>
          <IncButton onClick={() => adjustmentButton(numSabots, setNumSabots, -sabotsButtonNum, maxSabots)}>
            -{numberToAbbreviation(sabotsButtonNum)}
          </IncButton>
          <IncInput min={0} max={maxSabots} type="range" value={numSabots} onChangeText={setNumSabots} />
          <IncButton onClick={() => adjustmentButton(numSabots, setNumSabots, sabotsButtonNum, maxSabots)}>
            +{numberToAbbreviation(sabotsButtonNum)}
          </IncButton>
        </div>
      </IncContainer>
      <br />
      {ownSabots === 0 ? null : <div>Propios: {ownSabots.toLocaleString()}</div>}
      {corpSabots === 0 ? null : <div>De corporación: {corpSabots.toLocaleString()}</div>}
      <div>Total: {(ownSabots + corpSabots).toLocaleString()}</div>

      <br />

      <IncContainer>
        <div className={missionModalStyles.inputLabel}>
          <div>{PERSONNEL_OBJ.thieves.name}</div>
          <IncButton onClick={() => adjustmentButton(numThieves, setNumThieves, -thievesButtonNum, maxThieves)}>
            -{numberToAbbreviation(thievesButtonNum)}
          </IncButton>
          <IncInput min={0} max={maxThieves} type="range" value={numThieves} onChangeText={setNumThieves} />
          <IncButton onClick={() => adjustmentButton(numThieves, setNumThieves, thievesButtonNum, maxThieves)}>
            +{numberToAbbreviation(thievesButtonNum)}
          </IncButton>
        </div>
      </IncContainer>
      <br />
      {ownThieves === 0 ? null : <div>Propios: {ownThieves.toLocaleString()}</div>}
      {corpThieves === 0 ? null : <div>De corporación: {corpThieves.toLocaleString()}</div>}
      <div>Total: {(ownThieves + corpThieves).toLocaleString()}</div>

      <br />

      {user && (
        <>
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
          <div>
            <label>
              Reponer personal perdido:{' '}
              <IncInput type="checkbox" value={rebuyLostTroops} onChangeText={setRebuyLostTroops} />
            </label>
          </div>
        </>
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
