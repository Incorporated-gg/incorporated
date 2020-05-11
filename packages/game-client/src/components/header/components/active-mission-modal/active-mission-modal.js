import React from 'react'
import PropTypes from 'prop-types'
import styles from './active-mission-modal.module.scss'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import { useUserData } from 'lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import MissionTimer from 'components/reports/mission-timer/mission-timer'
import { cancelActiveMission } from 'lib/utils'
import Icon from 'components/icon'
import NotepadPage from 'components/UI/notepad-page'
import UserLink from 'components/UI/user-link'

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

  const buildingInfo = buildingsList.find(b => b.id === activeMision.target_building)

  return (
    <IncContainer withHairline darkBg>
      <div className={styles.container}>
        <NotepadPage>
          <div style={{ padding: 10 }}>
            <div className={styles.title}>
              Detalles de {activeMision.mission_type === 'attack' ? 'ataque' : 'espionaje'}
            </div>
            <div className={styles.subtitle}>Objetivos</div>
            <div className={styles.dottedLineSpacer} />

            {activeMision.target_hood ? (
              <div>{activeMision.target_hood.name}</div>
            ) : (
              <UserLink colorScheme="dark" user={activeMision.target_user} />
            )}

            <div>{!buildingInfo ? '' : buildingInfo.name}</div>

            <div className={styles.subtitle}>Tropas</div>
            <div className={styles.dottedLineSpacer} />

            <AttackTroopsDetails activeMision={activeMision} />
            <div className={`${styles.troopsRow} ${styles.rowHighlight}`}>
              <div>TIEMPO RESTANTE</div>
              <div>
                <MissionTimer finishesAt={activeMision.will_finish_at} isMyMission />
              </div>
            </div>

            <div className={styles.cancelMission} onClick={cancelMission}>
              <span>CANCELAR MISIÓN</span>
              <Icon svg={require('./img/cancel.svg')} size={20} />
            </div>
          </div>
        </NotepadPage>
      </div>
    </IncContainer>
  )
}

AttackTroopsDetails.propTypes = {
  activeMision: PropTypes.object.isRequired,
}
function AttackTroopsDetails({ activeMision }) {
  return (
    <div className={styles.attackDetailsContainer}>
      {activeMision.mission_type === 'attack' ? (
        <>
          <div className={styles.troopsRow}>
            <div>Matones</div>
            <div>{activeMision.sent_sabots.toLocaleString()}</div>
          </div>
          <div className={styles.troopsRow}>
            <div>Ladrones</div>
            <div>{activeMision.sent_thieves.toLocaleString()}</div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.troopsRow}>
            <div>Espías</div>
            <div>{activeMision.sent_spies.toLocaleString()}</div>
          </div>
        </>
      )}
    </div>
  )
}
