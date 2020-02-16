import React, { useState, useCallback, useEffect } from 'react'
import api from '../../lib/api'
import { useUserData } from '../../lib/user'
import { personnelList } from 'shared-lib/personnelUtils'
import { calculateMissionTime } from 'shared-lib/missionsUtils'
import PropTypes from 'prop-types'
import styles from './Missions.module.scss'
import Modal from 'react-modal'

MissionSpyModal.propTypes = {
  user: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionSpyModal({ user, isOpen, onRequestClose }) {
  const userData = useUserData()
  const [toUser, setToUser] = useState((user && user.username) || '')
  const [numTroops, setNumTroops] = useState(() => {
    return userData.personnel.spies
  })
  const isFormReady = toUser && numTroops && numTroops > 0

  useEffect(() => {
    setNumTroops(userData.personnel.spies)
  }, [userData.personnel.sabots, userData.personnel.spies])

  const startMission = useCallback(
    e => {
      e.preventDefault()
      if (!isFormReady) return
      api
        .post('/v1/missions', {
          missionType: 'spy',
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

  const troopName = personnelList.find(p => p.resource_id === 'spies').name

  const missionSeconds = calculateMissionTime('spy')

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <form className={styles.startNewMission}>
        <div>
          <label>
            Usuario a espiar
            {': '}
            <input type="text" name="" value={toUser} onChange={e => setToUser(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            {troopName}
            {': '}
            <input type="number" name="quantity" value={numTroops} onChange={e => setNumTroops(e.target.value)} />
          </label>
        </div>
        <div>Tiempo de mision: {missionSeconds}s</div>
        <div>
          <button onClick={startMission} disabled={!isFormReady}>
            Enviar
          </button>
        </div>
      </form>
    </Modal>
  )
}
