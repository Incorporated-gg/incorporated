import React, { useState, useEffect } from 'react'
import { getServerDate, getServerDay } from 'shared-lib/serverTime'
import Newspaper from 'components/newspaper'
import Container from 'components/UI/container'

export default function NewspaperPage() {
  return (
    <Container darkBg>
      <div style={{ padding: 10, textAlign: 'center' }}>
        <ServerTime />
        <Newspaper />
      </div>
    </Container>
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

  const currentServerDay = getServerDay()

  return (
    <div>
      Día {currentServerDay}. Hora server: {pad(serverDate.hours)}:{pad(serverDate.minutes)}:{pad(serverDate.seconds)}
    </div>
  )
}
