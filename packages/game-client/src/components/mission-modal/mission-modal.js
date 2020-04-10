import React from 'react'
import PropTypes from 'prop-types'
import styles from './mission-modal.module.scss'
import Modal from 'react-modal'
import MissionModalSpy from './components/mission-modal-spy'
import MissionModalAttack from './components/mission-modal-attack'
import MissionModalSimulate from './components/mission-modal-simulate'
import Container from 'components/UI/container'

MissionModal.propTypes = {
  user: PropTypes.object,
  hood: PropTypes.object,
  missionType: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function MissionModal({ missionType, user, hood, isOpen, onRequestClose }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen && <Mission missionType={missionType} user={user} hood={hood} onRequestClose={onRequestClose} />}
    </Modal>
  )
}

Mission.propTypes = {
  user: PropTypes.object,
  hood: PropTypes.object,
  missionType: PropTypes.string.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
function Mission({ missionType, user, hood, onRequestClose }) {
  return (
    <Container withHairline darkBg borderSize={20}>
      <form className={styles.startNewMission}>
        {missionType === 'attack' ? (
          <MissionModalAttack user={user} hood={hood} onRequestClose={onRequestClose} />
        ) : missionType === 'spy' ? (
          <MissionModalSpy user={user} onRequestClose={onRequestClose} />
        ) : (
          missionType === 'simulate' && <MissionModalSimulate />
        )}
      </form>
    </Container>
  )
}
