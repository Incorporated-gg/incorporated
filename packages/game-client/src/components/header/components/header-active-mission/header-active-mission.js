import React, { useState } from 'react'
import headerStyles from '../../header.module.scss'
import { useUserData } from 'lib/user'
import { MissionTimer } from 'routes/Reports/MissionRow'
import Icon from 'components/icon'
import ActiveMissionModal from '../active-mission-modal'

export default function ActiveMission() {
  const userData = useUserData()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {userData.active_mission ? (
        <>
          <div onClick={() => setIsModalOpen(true)} className={`${headerStyles.stat} ${headerStyles.statMission1}`}>
            <MissionTimer finishesAt={userData.active_mission.will_finish_at} isMyMission />{' '}
            <Icon iconName="dynamite" className={headerStyles.headerStatIcon} />
          </div>
          <div onClick={() => setIsModalOpen(true)} className={`${headerStyles.stat} ${headerStyles.statMission2}`}>
            +
          </div>
          <ActiveMissionModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
        </>
      ) : (
        <>
          <div className={`${headerStyles.stat} ${headerStyles.statMission1}`}>
            <span>N/A</span>
            <Icon iconName="dynamite" className={headerStyles.headerStatIcon} />
          </div>
          <div className={`${headerStyles.stat} ${headerStyles.statMission2}`}>+</div>
        </>
      )}
    </>
  )
}
