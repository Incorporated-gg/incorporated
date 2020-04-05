import React, { useState } from 'react'
import styles from './header-active-mission.module.scss'
import { useUserData } from 'lib/user'
import MissionTimer from 'components/reports/mission-timer/mission-timer'
import Icon from 'components/icon'
import ActiveMissionModal from '../active-mission-modal'
import Container from 'components/UI/container'

export default function ActiveMission() {
  const userData = useUserData()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // userData.active_mission = { will_finish_at: Date.now() / 1000 + 264 } // Uncomment to fake a mission to develop this component easily
  if (!userData.active_mission) return null

  return (
    <>
      <Container darkBg style={{ display: 'flex' }}>
        <div onClick={() => setIsModalOpen(true)} className={`${styles.stat} ${styles.statMission1}`}>
          <MissionTimer finishesAt={userData.active_mission.will_finish_at} isMyMission />{' '}
          <Icon iconName="dynamite" className={styles.headerStatIcon} />
        </div>
        <div onClick={() => setIsModalOpen(true)} className={`${styles.stat} ${styles.statMission2}`}>
          +
        </div>
      </Container>
      <ActiveMissionModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
    </>
  )
}
