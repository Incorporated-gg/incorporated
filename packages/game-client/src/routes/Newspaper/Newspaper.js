import React, { useState, useEffect } from 'react'
import { getServerDate, getServerDay } from 'shared-lib/serverTime'
import styles from './Newspaper.module.scss'

export default function Newspaper() {
  return (
    <div className={styles.container}>
      <ServerTime />
    </div>
  )
}
function ServerTime() {
  const [reloaded, reload] = useState()
  useEffect(() => {
    const timeout = setTimeout(reload, 1000, {})
    return () => clearTimeout(timeout)
  }, [reloaded])

  const serverDate = getServerDate()

  function pad(number) {
    return number.toString().padStart(2, '0')
  }

  return (
    <span>
      Día {getServerDay()}. Hora server: {pad(serverDate.hours)}:{pad(serverDate.minutes)}:{pad(serverDate.seconds)}
    </span>
  )
}
