import React from 'react'
import { useAccountData } from 'lib/user'
import styles from './account-avi-and-lvl.module.scss'
import { useHistory } from 'react-router-dom'
import ProgressBar from 'components/UI/progress-bar'

export default function AccountAviAndLvl() {
  let history = useHistory()
  const accountData = useAccountData()
  const openAccountPanel = () => {
    history.push('/settings')
  }
  return (
    <div className={styles.container} onClick={openAccountPanel}>
      <div className={styles.avatar}>
        <img src={accountData.avatar} alt={'Avatar de usuario'} />
      </div>
      <div className={styles.lvlContainer}>
        <ProgressBar direction="vertical" progressPercentage={(accountData.xp / accountData.levelUpXP) * 100} />
        <div className={styles.levelText}>{accountData.level}</div>
      </div>
    </div>
  )
}
