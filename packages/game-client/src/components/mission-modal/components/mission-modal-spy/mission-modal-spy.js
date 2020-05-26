import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import {
  calculateMissionTime,
  calcSpyFailProbabilities,
  calcSpyInformationPercentageRange,
} from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import IncButton from 'components/UI/inc-button'
import styles from './mission-modal-spy.module.scss'
import missionModalStyles from '../../mission-modal.module.scss'
import Icon from 'components/icon'
import IncProgressBar from 'components/UI/inc-progress-bar'
import { getTimeUntil } from 'lib/utils'
import TroopRangeInput from '../troop-range-input/troop-range-input'

MissionModalSpy.propTypes = {
  user: PropTypes.object.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionModalSpy({ user, onRequestClose }) {
  const userData = useUserData()
  const [numSpies, setNumSpies] = useState(userData.personnel.spies)
  const isFormReady = numSpies > 0

  const espionageProbabilities = calcSpyFailProbabilities({
    resLvlAttacker: userData.researchs[1],
    resLvLDefender: user.spy_research_level,
    spiesSent: numSpies,
  })
  const informationPercentageRange = calcSpyInformationPercentageRange({
    resLvlAttacker: userData.researchs[1],
    resLvLDefender: user.spy_research_level,
    spiesRemaining: numSpies,
  })

  useEffect(() => {
    setNumSpies(userData.personnel.spies)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const startMission = useCallback(
    e => {
      e.preventDefault()
      if (!isFormReady) return
      api
        .post('/v1/missions/create', {
          mission_type: 'spy',
          target_user: user.username,
          sent_spies: numSpies,
        })
        .then(() => {
          onRequestClose()
        })
        .catch(error => alert(error))
    },
    [isFormReady, numSpies, onRequestClose, user.username]
  )

  const missionSeconds = calculateMissionTime('spy')

  return (
    <>
      <div className={missionModalStyles.title}>Espiar a {user.username}</div>

      <div>
        <p className={styles.subtitle}>Probabilidades de ser detectados:</p>
        <p>Por nivel: {Math.round(espionageProbabilities.level * 10) / 10}%</p>
        <p>Por nº de espías: {Math.round(espionageProbabilities.spies * 10) / 10}%</p>
        <p>Total: {Math.round(espionageProbabilities.total * 10) / 10}%</p>
      </div>

      <br />

      <div>
        <p className={styles.subtitle}>Información obtenida con {numSpies.toLocaleString()} espías:</p>
        <p>Mínimo: {Math.floor(informationPercentageRange.min * 10) / 10}%</p>
        <p>Máximo: {Math.floor(informationPercentageRange.max * 10) / 10}%</p>
      </div>

      <br />

      <TroopRangeInput
        name={PERSONNEL_OBJ.spies.name}
        value={numSpies}
        max={userData.personnel.spies}
        setValue={setNumSpies}
      />
      <br />

      <IncButton outerStyle={{ width: '100%' }} onClick={startMission} disabled={!isFormReady}>
        <div className={missionModalStyles.sendButtonTimer}>
          <div>{getTimeUntil(Date.now() / 1000 + missionSeconds, true)}</div>
          <IncProgressBar direction="horizontal" color="red" progressPercentage={100} />
        </div>
        <div className={missionModalStyles.sendButtonTitle}>
          ESPIAR <Icon iconName="spy_map" size={30} />
        </div>
      </IncButton>
    </>
  )
}
