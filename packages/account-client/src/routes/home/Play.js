import React from 'react'
import styles from './play.module.scss'
import { sessionID } from '../../lib/user'

function Play() {
  const PLAY_LINK = process.env.NODE_ENV === 'development' ? 'http://localhost:3100' : 'https://play.incorporated.gg'

  // This is a terrible way to pass the sessionID.
  // TODO: Find a better way
  return (
    <a className={styles.play} href={`${PLAY_LINK}?sessionID=${sessionID}`}>
      Jugar
    </a>
  )
}

export default Play
