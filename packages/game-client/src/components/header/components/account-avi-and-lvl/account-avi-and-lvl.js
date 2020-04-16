import React, { useState, useEffect } from 'react'
import { useUserData } from 'lib/user'
import styles from './account-avi-and-lvl.module.scss'
import { useHistory } from 'react-router-dom'
import ProgressBar from 'components/UI/progress-bar'
import { getServerDate, getServerDay } from 'shared-lib/serverTime'

export default function AccountAviAndLvl() {
  let history = useHistory()
  const { accountData } = useUserData()
  const openAccountPanel = () => {
    history.push('/settings')
  }
  return (
    <div className={styles.container} onClick={openAccountPanel}>
      <div className={styles.avatar}>
        <img src={accountData.avatar} alt={'Avatar de usuario'} />
        <div className={styles.serverDateContainer}>
          <ServerTime />
        </div>
      </div>
      <div className={styles.lvlContainer}>
        <ProgressBar
          showBorder
          direction="vertical"
          progressPercentage={(accountData.xp / accountData.levelUpXP) * 100}
        />
        <div className={styles.levelText}>{accountData.level}</div>
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
