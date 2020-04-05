import React from 'react'
import Container from 'components/UI/container'
import Icon from 'components/icon'
import { useUserData } from 'lib/user'
import { numberToAbbreviation } from 'lib/utils'
import styles from './money-and-gold.module.scss'

export default function MoneyAndGold() {
  return (
    <div className={styles.moneyAndGoldContainer}>
      <Container darkBg outerClassName={styles.statContainer}>
        <div className={styles.stat}>
          <MyMoney /> <Icon iconName="money" className={styles.headerStatIcon} />
        </div>
      </Container>
      <Container darkBg outerClassName={styles.statContainer}>
        <div className={styles.stat}>
          <MyGold /> <Icon iconName="gold" className={styles.headerStatIcon} />
        </div>
      </Container>
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

  return numberToAbbreviation(userData.gold)
}
