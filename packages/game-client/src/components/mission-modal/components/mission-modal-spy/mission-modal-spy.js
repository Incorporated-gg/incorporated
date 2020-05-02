import React, { useState, useCallback, useEffect } from 'react'
import api from 'lib/api'
import { useUserData } from 'lib/user'
import { personnelObj } from 'shared-lib/personnelUtils'
import { calculateMissionTime, calcSpyFailProbabilities } from 'shared-lib/missionsUtils'
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
        <p>Probabilidades de fallo:</p>
        <p>
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
        </p>
        <p>Base: {espionageProbabilities.base}%</p>
        <p>Por nivel: {Math.round(espionageProbabilities.level * 10) / 10}%</p>
        <p>Por nº de espías: {Math.round(espionageProbabilities.spies * 10) / 10}%</p>
        <p>Total: {Math.round(espionageProbabilities.total * 10) / 10}%</p>
      </div>
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
