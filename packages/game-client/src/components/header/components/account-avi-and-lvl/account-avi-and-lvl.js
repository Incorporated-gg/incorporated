import React, { useState, useEffect } from 'react'
import { useUserData } from 'lib/user'
import styles from './account-avi-and-lvl.module.scss'
import { useHistory } from 'react-router-dom'
import IncProgressBar from 'components/UI/inc-progress-bar'
import { getServerDate, getServerDay } from 'shared-lib/serverTime'

export default function AccountAviAndLvl() {
  let history = useHistory()
  const userData = useUserData()
  const openAccountPanel = () => {
    history.push('/settings')
  }
  return (
    <div className={styles.container} onClick={openAccountPanel}>
      <div className={styles.avatar}>
        <img src={userData.account.avatar} alt={'Avatar de usuario'} />
        <div className={styles.serverDateContainer}>
          <ServerTime />
        </div>
      </div>
      <div className={styles.lvlContainer}>
        <IncProgressBar
          showBorder
          direction="vertical"
          progressPercentage={(userData.account.xp / userData.account.levelUpXP) * 100}
        />
        <div className={styles.levelText}>{userData.account.level}</div>
      </div>
    </div>
  )
}

function ServerTime() {
  const [, _reload] = useState()
  useEffect(() => {
    const timeout = setTimeout(_reload, 3000, {})
    return () => clearTimeout(timeout)
  }, [])

  const serverDate = getServerDate()
  const currentServerDay = getServerDay()

  function pad(number) {
    return number.toString().padStart(2, '0')
  }

  return (
    <>
      <span>Día {currentServerDay}</span>
      <span>
        {pad(serverDate.hours)}:{pad(serverDate.minutes)}
      </span>
    </>
  )
}
