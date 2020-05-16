import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { useUserData, userData } from 'lib/user'
import NewMessageModal from 'components/messages/components/new-message-modal'
import { calculateIsInAttackRange } from 'shared-lib/missionsUtils'
import MissionModal from '../../mission-modal'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import IncButton from '../inc-button'
import Icon from 'components/icon'
import styles from './user-action-buttons.module.scss'
import ChatContext from '../../../context/chat-context'

UserActionButtons.propTypes = {
  user: PropTypes.object.isRequired,
  onActionClicked: PropTypes.func,
}
export default function UserActionButtons({ user, onActionClicked }) {
  useUserData()
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showAttackModal, setShowAttackModal] = useState(false)
  const [showSpyModal, setShowSpyModal] = useState(false)
  const chatContext = useContext(ChatContext)

  if (!user) return <span>Usuario desconocido</span>

  const isMe = userData.id === user.id
  const canAttack = getCanAttackUser(user)
  return (
    <>
      <IncButton
        disabled={!canAttack}
        onClick={() => {
          setShowAttackModal(true)
          if (onActionClicked) onActionClicked()
        }}
        outerClassName={styles.button}
        borderSize={3}>
        <Icon svg={require('./img/attack.svg')} size={20} />
      </IncButton>
      <IncButton
        disabled={isMe}
        onClick={() => {
          setShowSpyModal(true)
          if (onActionClicked) onActionClicked()
        }}
        outerClassName={styles.button}
        borderSize={3}>
        <Icon svg={require('./img/spy.svg')} size={20} />
      </IncButton>
      <IncButton
        disabled={isMe}
        onClick={() => {
          setShowMessageModal(true)
          if (onActionClicked) onActionClicked()
        }}
        outerClassName={styles.button}
        borderSize={3}>
        <Icon svg={require('./img/message.svg')} size={20} />
      </IncButton>
      <IncButton
        disabled={isMe}
        onClick={() => {
          chatContext.openChatWith(user.username)
          if (onActionClicked) onActionClicked()
        }}
        outerClassName={styles.button}
        borderSize={3}>
        <Icon svg={require('./img/chat.svg')} size={20} />
      </IncButton>
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

function getCanAttackUser(user) {
  // Is me
  const isMe = userData.id === user.id
  if (isMe) return false

  // Part of our alliance
  const shareAlliance = userData.alliance && user.alliance && userData.alliance.id === user.alliance.id
  if (shareAlliance) return false

  // Is inside of attack range
  const currentOptimizeLvl = userData.researchs[5]
  const userIncome = Object.entries(userData.buildings).reduce(
    (prev, [buildingID, { quantity }]) =>
      prev + (calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl) || 0),
    0
  )

  return calculateIsInAttackRange(userIncome, user.income)
}
