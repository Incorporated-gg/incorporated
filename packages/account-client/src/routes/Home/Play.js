import React from 'react'
import styles from './style.module.scss'
import { sessionID } from '../../lib/user'

function Play() {
  const PLAY_LINK = process.env.NODE_ENV === 'development' ? 'http://localhost:3100' : 'https://play.incorporated.gg'

  return (
    <a className={styles.play} href={`${PLAY_LINK}?sessionID=${sessionID}`}>
      Jugar
    </a>
  )
}

export default Play
