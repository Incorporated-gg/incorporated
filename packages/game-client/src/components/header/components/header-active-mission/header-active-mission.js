import React, { useState } from 'react'
import styles from './header-active-mission.module.scss'
import { useUserData } from 'lib/user'
import MissionTimer from 'components/reports/mission-timer/mission-timer'
import ActiveMissionModal from '../active-mission-modal'
import Container from 'components/UI/container'
import IncButton from 'components/UI/inc-button'
import UserLink from 'components/UI/UserLink'
import { cancelActiveMission } from 'lib/utils'

export default function ActiveMission() {
  const userData = useUserData()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Uncomment to fake a mission to develop this component easily
  // userData.active_mission = getFakeMissionForDev()

  const cancelMission = () => {
    if (!window.confirm('Estás seguro de que quieres cancelar la misión?')) return
    cancelActiveMission().catch(err => {
      alert(err.message)
    })
  }

  if (!userData.active_mission) return null

  return (
    <>
      <div className={styles.container}>
        <Container withHairline borderSize={4} darkBg style={{ display: 'flex' }}>
          <div className={`${styles.stat} ${styles.statMission1}`}>
            {userData.active_mission.mission_type}
            <span> -&gt; </span>
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
            <IncButton onClick={cancelMission}>Cancelar</IncButton>
          </div>
        </Container>
      </div>
      <ActiveMissionModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
    </>
  )
}

// eslint-disable-next-line no-unused-vars
function getFakeMissionForDev() {
  return JSON.parse(
    `{"user":{"id":1,"username":"niciusb","rank_position":1,"income":5197500,"alliance":{"id":3,"created_at":1586805423,"picture_url":null,"long_name":"wfefew","short_name":"fe","description":"feffe","badge":{"_v":1,"background":{"id":5,"color1":"#0089FF","color2":"#20BF55"},"icon":{"id":5,"color":"#0089FF"}}},"accountData":{"avatar":"https://avatars.fra1.cdn.digitaloceanspaces.com/1.jpg"}},"target_user":{"id":2,"username":"test","rank_position":2,"income":0,"alliance":{"id":4,"created_at":1586806629,"picture_url":null,"long_name":"ali","short_name":"ali","description":"ali ali anza","badge":{"_v":1,"background":{"id":2,"color1":"#000000","color2":"#FF0000"},"icon":{"id":4,"color":"#FFFFFF"}}},"accountData":{"avatar":"https://avatars.fra1.cdn.digitaloceanspaces.com/1.jpg"}},"mission_type":"spy","sent_spies":1,"started_at":1586893990,"will_finish_at":${Math.floor(
      Date.now() / 1000 + 60 * 3
    )},"completed":0,"result":null}`
  )
}
