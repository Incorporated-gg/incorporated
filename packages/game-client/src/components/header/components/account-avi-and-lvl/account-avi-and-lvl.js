import React from 'react'
import { useAccountData } from 'lib/user'
import styles from './account-avi-and-lvl.module.scss'
import { useHistory } from 'react-router-dom'
import Container from 'components/UI/container'

export default function AccountAviAndLvl() {
  let history = useHistory()
  const accountData = useAccountData()
  const openAccountPanel = () => {
    history.push('/settings')
  }
  return (
    <div className={styles.container} onClick={openAccountPanel}>
      <Container style={{ padding: 0, lineHeight: 0 }}>
        <img src={accountData.avatar} alt={'Avatar de usuario'} className={styles.avatar} />
      </Container>
      <div className={styles.lvlText} title={`${accountData.xp}/${accountData.levelUpXP} XP`}>
        Lvl {accountData.level}
      </div>
    </div>
  )
}
