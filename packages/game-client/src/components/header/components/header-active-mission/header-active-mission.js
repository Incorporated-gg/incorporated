import React, { useState } from 'react'
import styles from './header-active-mission.module.scss'
import { useUserData } from 'lib/user'
import MissionTimer from 'components/reports/mission-timer/mission-timer'
import ActiveMissionModal from '../active-mission-modal'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import UserLink from 'components/UI/user-link'
import { cancelActiveMission } from 'lib/utils'
import Icon from 'components/icon'

export default function ActiveMission() {
  const userData = useUserData()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const cancelMission = () => {
    if (!window.confirm('Estás seguro de que quieres cancelar la misión?')) return
    cancelActiveMission().catch(err => {
      alert(err.message)
    })
  }

  if (!userData.active_mission) return null

  const missionSvg =
    userData.active_mission.mission_type === 'spy' ? require('./img/spy.svg') : require('./img/attack.svg')
  return (
    <>
      <div className={styles.container}>
        <IncContainer withHairline borderSize={4} darkBg style={{ display: 'flex' }}>
          <div className={`${styles.stat} ${styles.statMission1}`}>
            {}
            <Icon svg={missionSvg} size={30} />
            <Icon svg={require('./img/arrows.svg')} width={40} height={15} />
            {userData.active_mission.target_hood ? (
              userData.active_mission.target_hood.name
            ) : (
              <UserLink user={userData.active_mission.target_user} />
            )}
          </div>
          <div className={`${styles.stat} ${styles.statMission2}`}>
            <div>TIEMPO</div>
            <MissionTimer finishesAt={userData.active_mission.will_finish_at} isMyMission />
          </div>
          <div className={`${styles.stat} ${styles.statMission3}`}>
            <IncButton onClick={() => setIsModalOpen(true)}>Detalles</IncButton>
            <div style={{ width: 10 }} />
            <IncButton onClick={cancelMission}>
              <Icon svg={require('./img/cancel.svg')} size={20} />
            </IncButton>
          </div>
        </IncContainer>
      </div>
      <ActiveMissionModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
    </>
  )
}
