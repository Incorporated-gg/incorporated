import React from 'react'
import Icon from 'components/icon'
import { useUserData } from 'lib/user'
import styles from './money-and-gold.module.scss'
import { numberToAbbreviation } from 'lib/utils'
import IncButton from 'components/UI/inc-button'
import { Link } from 'react-router-dom'

export default function MoneyAndGold() {
  return (
    <div className={styles.moneyAndGoldContainer}>
      <Link className={styles.linkButtonContainer} to="/finances">
        <IncButton borderSize={3} withHairline darkBg outerClassName={styles.statContainer}>
          <div className={styles.stat}>
            <MyGold /> <Icon iconName="gold" className={styles.headerStatIcon} />
          </div>
        </IncButton>
      </Link>
      <Link className={styles.linkButtonContainer} to="/finances">
        <IncButton borderSize={3} withHairline darkBg outerClassName={styles.statContainer}>
          <div className={styles.stat}>
            <MyMoney /> <Icon iconName="money" className={styles.headerStatIcon} />
          </div>
        </IncButton>
      </Link>
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
