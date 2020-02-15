import React from 'react'
import styles from './header-active-mission.module.scss'
import { useUserData, reloadUserData } from 'lib/user'
import MissionRow from 'routes/Reports/MissionRow'

export default function ActiveMission() {
  const userData = useUserData()
  if (!userData.active_mission) return null

  return (
    <div className={styles.headerActiveMission}>
      <h1>Misión activa</h1>
      <table>
        <tbody>
          <MissionRow mission={userData.active_mission} reloadMissionsCallback={reloadUserData} />
        </tbody>
      </table>
    </div>
  )
}
