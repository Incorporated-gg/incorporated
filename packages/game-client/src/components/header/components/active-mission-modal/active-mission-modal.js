import React from 'react'
import PropTypes from 'prop-types'
import styles from './active-mission-modal.module.scss'
import Modal from 'react-modal'
import Container from 'components/UI/container'
import { useUserData } from 'lib/user'
import AllianceBadge from 'components/alliance/alliance-badge'
import { buildingsList } from 'shared-lib/buildingsUtils'
import MissionTimer from 'components/reports/mission-timer/mission-timer'
import { cancelActiveMission } from 'lib/utils'

ActiveMissionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function ActiveMissionModal({ isOpen, onRequestClose }) {
  return (
    <Modal overlayClassName="backdropBlur" isOpen={isOpen} onRequestClose={onRequestClose} className={styles.modal}>
      <ActiveMissionModalContent onRequestClose={onRequestClose} />
    </Modal>
  )
}

ActiveMissionModalContent.propTypes = {
  onRequestClose: PropTypes.func.isRequired,
}
function ActiveMissionModalContent({ onRequestClose }) {
  const userData = useUserData()
  const activeMision = userData.active_mission
  if (!activeMision) {
    onRequestClose()
    return
  }

  const cancelMission = () => {
    if (!window.confirm('Estás seguro de que quieres cancelar la misión?')) return
    onRequestClose()
    cancelActiveMission().catch(err => {
      alert(err.message)
    })
  }

  return (
    <Container withHairline darkBg borderSize={20}>
      <div className={styles.container}>
        <Container onClick={onRequestClose} outerClassName={styles.closeButton}>
          x
        </Container>
        <h1>Misión activa</h1>
        <div className={styles.vsContainer}>
          <div className={styles.avatarContainer}>
            <img src={activeMision.user.avatar} alt={activeMision.user.username} />
            {activeMision.user.alliance && (
              <div className={`${styles.allianceBadgeContainer} ${styles.first}`}>
                <AllianceBadge badge={activeMision.user.alliance.badge} />
              </div>
            )}
          </div>
          <div>¡{activeMision.mission_type === 'attack' ? 'Ataque' : 'Espionaje'}!</div>
          <div className={styles.avatarContainer}>
            {activeMision.target_hood ? (
              activeMision.target_hood.name
            ) : (
              <>
                <img src={activeMision.target_user.avatar} alt={activeMision.target_user.username} />
                {activeMision.target_user.alliance && (
                  <div className={`${styles.allianceBadgeContainer} ${styles.second}`}>
                    <AllianceBadge badge={activeMision.target_user.alliance.badge} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {activeMision.mission_type === 'attack' && <AttackDetails activeMision={activeMision} />}
        <div className={styles.optionsContainer}>
          <div>
            <h1>Tiempo Restante</h1>
            <div>
              <h1>
                <MissionTimer finishesAt={activeMision.will_finish_at} isMyMission />
              </h1>
            </div>
          </div>
          <div>
            <button onClick={cancelMission}>Cancelar misión</button>
          </div>
        </div>
      </div>
    </Container>
  )
}

AttackDetails.propTypes = {
  activeMision: PropTypes.object.isRequired,
}
function AttackDetails({ activeMision }) {
  const buildingInfo = buildingsList.find(b => b.id === activeMision.target_building)

  return (
    <div className={styles.attackDetailsContainer}>
      <div>
        <h1>Matones</h1>
        <div>{activeMision.sent_sabots.toLocaleString()}</div>
      </div>
      <div>
        <h1>Objectivo</h1>
        <div>{activeMision.target_hood ? activeMision.target_hood.name : buildingInfo.name}</div>
      </div>
      <div>
        <h1>Ladrones</h1>
        <div>{activeMision.sent_thieves.toLocaleString()}</div>
      </div>
    </div>
  )
}
