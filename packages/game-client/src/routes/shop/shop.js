import React from 'react'
import styles from './shop.module.scss'
import IncContainer from 'components/UI/inc-container'

export default function Shop() {
  return (
    <IncContainer darkBg>
      <div className={styles.container}>
        <div className={styles.title}>Tienda</div>
        <div className={styles.subtitle}>Coming soon!</div>
      </div>
    </IncContainer>
  )
}
