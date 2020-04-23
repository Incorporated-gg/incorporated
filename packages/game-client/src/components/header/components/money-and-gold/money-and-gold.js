import React from 'react'
import IncContainer from 'components/UI/inc-container'
import Icon from 'components/icon'
import { useUserData } from 'lib/user'
import styles from './money-and-gold.module.scss'
import { numberToAbbreviation } from 'lib/utils'

export default function MoneyAndGold() {
  return (
    <div className={styles.moneyAndGoldContainer}>
      <IncContainer borderSize={4} withHairline darkBg outerClassName={styles.statContainer}>
        <div className={styles.stat}>
          <MyGold /> <Icon iconName="gold" className={styles.headerStatIcon} />
        </div>
      </IncContainer>
      <IncContainer borderSize={4} withHairline darkBg outerClassName={styles.statContainer}>
        <div className={styles.stat}>
          <MyMoney /> <Icon iconName="money" className={styles.headerStatIcon} />
        </div>
      </IncContainer>
    </div>
  )
}

function MyMoney() {
  const userData = useUserData()
  if (!userData) return null

  return numberToAbbreviation(userData.money)
}

function MyGold() {
  const userData = useUserData()
  if (!userData) return null

  return numberToAbbreviation(userData.account.gold)
}
