import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { personnelObj } from 'shared-lib/personnelUtils'
import {
  calculateMissionTime,
  calcSpyFailProbabilities,
  calcSpyInformationPercentageRange,
} from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import IncButton from 'components/UI/inc-button'

MissionModalSpy.propTypes = {
  user: PropTypes.object,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionModalSpy({ user, onRequestClose }) {
  const userData = useUserData()
  const [theirLvl, setTheirLvl] = useState('')
  const [toUser, setToUser] = useState((user && user.username) || '')
  const [numTroops, setNumTroops] = useState(userData.personnel.spies)
  const isFormReady = toUser && numTroops && numTroops > 0

  const espionageProbabilities = calcSpyFailProbabilities({
    resLvlAttacker: userData.researchs[1],
    resLvLDefender: parseInt(theirLvl) || userData.researchs[1],
    spiesSent: numTroops,
  })
  const informationPercentageRange = calcSpyInformationPercentageRange({
    resLvlAttacker: userData.researchs[1],
    resLvLDefender: parseInt(theirLvl) || userData.researchs[1],
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
          target_user: toUser,
          sent_spies: numTroops,
        })
        .then(() => {
          onRequestClose()
        })
        .catch(error => alert(error))
    },
    [isFormReady, numTroops, onRequestClose, toUser]
  )

  const troopName = personnelObj.spies.name

  const missionSeconds = calculateMissionTime('spy')

  return (
    <>
      <div>
        <label>
          Su nivel de espionaje:
          <input
            type="number"
            min="1"
            placeholder={'Desconocido'}
            value={theirLvl}
            onChange={e => setTheirLvl(e.target.value)}
          />
        </label>
      </div>
      <br />
      <div>
        <p>Probabilidades de ser detectados:</p>
        <p>Base: {espionageProbabilities.base}%</p>
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
          Usuario a espiar:
          <input type="text" value={toUser} onChange={e => setToUser(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          {troopName}:
          <input min="1" type="number" value={numTroops} onChange={e => setNumTroops(e.target.value)} />
        </label>
      </div>
      <div>Tiempo de mision: {missionSeconds}s</div>
      <div>
        <IncButton onClick={startMission} disabled={!isFormReady}>
          Enviar
        </IncButton>
      </div>
    </>
  )
}
