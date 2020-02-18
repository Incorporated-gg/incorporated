import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './UserActionLinks.module.scss'
import { useUserData } from 'lib/user'
import NewMessageModal from 'routes/Messages/NewMessageModal'
import { NEWBIE_ZONE_DAILY_INCOME } from 'shared-lib/missionsUtils'
import MissionModal from '../mission-modal'

UserActionLinks.propTypes = {
  user: PropTypes.object.isRequired,
}
export default function UserActionLinks({ user }) {
  const userData = useUserData()
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showAttackModal, setShowAttackModal] = useState(false)
  const [showSpyModal, setShowSpyModal] = useState(false)

  if (!user) return <span>Usuario desconocido</span>

  const isMe = userData.id === user.id
  const shareAlliance = userData.alliance && user.alliance && userData.alliance.id === user.alliance.id
  const isInNewbieZone = user.income < NEWBIE_ZONE_DAILY_INCOME
  return (
    <>
      <button className={styles.button} onClick={() => setShowMessageModal(true)} disabled={isMe}>
        Enviar mensaje
      </button>
      <button
        className={styles.button}
        onClick={() => setShowAttackModal(true)}
        disabled={isMe || shareAlliance || isInNewbieZone}>
        Atacar
      </button>
      <button className={styles.button} onClick={() => setShowSpyModal(true)} disabled={isMe}>
        Espiar
      </button>
      <NewMessageModal user={user} isOpen={showMessageModal} onRequestClose={() => setShowMessageModal(false)} />
      <MissionModal
        missionType="attack"
        user={user}
        isOpen={showAttackModal}
        onRequestClose={() => setShowAttackModal(false)}
      />
      <MissionModal missionType="spy" user={user} isOpen={showSpyModal} onRequestClose={() => setShowSpyModal(false)} />
    </>
  )
}
