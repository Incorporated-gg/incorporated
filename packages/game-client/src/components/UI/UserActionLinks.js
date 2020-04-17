import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useUserData, userData } from 'lib/user'
import NewMessageModal from 'components/messages/components/new-message-modal'
import { calculateIsInAttackRange } from 'shared-lib/missionsUtils'
import MissionModal from '../mission-modal'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'

UserActionLinks.propTypes = {
  user: PropTypes.object.isRequired,
}
export default function UserActionLinks({ user }) {
  useUserData()
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showAttackModal, setShowAttackModal] = useState(false)
  const [showSpyModal, setShowSpyModal] = useState(false)

  if (!user) return <span>Usuario desconocido</span>

  const isMe = userData.id === user.id
  const canAttack = getCanAttackUser(user)
  return (
    <>
      <button onClick={() => setShowMessageModal(true)} disabled={isMe}>
        Enviar mensaje
      </button>{' '}
      <button onClick={() => setShowAttackModal(true)} disabled={!canAttack}>
        Atacar
      </button>{' '}
      <button onClick={() => setShowSpyModal(true)} disabled={isMe}>
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
