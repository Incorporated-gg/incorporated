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
import IncInput from 'components/UI/inc-input/inc-input'

MissionModalSpy.propTypes = {
  user: PropTypes.object.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionModalSpy({ user, onRequestClose }) {
  const userData = useUserData()
  const [numTroops, setNumTroops] = useState(userData.personnel.spies)
  const isFormReady = numTroops > 0

  const espionageProbabilities = calcSpyFailProbabilities({
    resLvlAttacker: userData.researchs[1],
    resLvLDefender: user.spy_research_level,
    spiesSent: numTroops,
  })
  const informationPercentageRange = calcSpyInformationPercentageRange({
    resLvlAttacker: userData.researchs[1],
    resLvLDefender: user.spy_research_level,
    spiesRemaining: numTroops,
  })

  useEffect(() => {
    setNumTroops(userData.personnel.spies)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const startMission = useCallback(
    e => {
      e.preventDefault()
      if (!isFormReady) return
      api
        .post('/v1/missions/create', {
          mission_type: 'spy',
          target_user: user.username,
          sent_spies: numTroops,
        })
        .then(() => {
          onRequestClose()
        })
        .catch(error => alert(error))
    },
    [isFormReady, numTroops, onRequestClose, user.username]
  )

  const troopName = PERSONNEL_OBJ.spies.name

  const missionSeconds = calculateMissionTime('spy')

  return (
    <>
      <div>Usuario a espiar: {user.username}</div>
      <div>Tiempo de mision: {missionSeconds}s</div>
      <br />
      <div>
        <p>Probabilidades de ser detectados:</p>
        <p>Por nivel: {Math.round(espionageProbabilities.level * 10) / 10}%</p>
        <p>Por nº de espías: {Math.round(espionageProbabilities.spies * 10) / 10}%</p>
        <p>Total: {Math.round(espionageProbabilities.total * 10) / 10}%</p>
      </div>
      <br />
      <div>
        <p>Información obtenida con {numTroops.toLocaleString()} espías:</p>
        <p>Mínimo: {Math.floor(informationPercentageRange.min * 10) / 10}%</p>
        <p>Máximo: {Math.floor(informationPercentageRange.max * 10) / 10}%</p>
      </div>
      <br />
      <div>
        <label>
          {troopName}:
          <IncInput showBorder min="1" type="number" value={numTroops} onChangeText={setNumTroops} />
        </label>
      </div>
      <br />
      <IncButton onClick={startMission} disabled={!isFormReady}>
        Enviar
      </IncButton>
    </>
  )
}
