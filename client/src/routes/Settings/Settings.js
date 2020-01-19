import React, { useState, useEffect } from 'react'
import FinancialData from './FinancialData'
import { getServerDate } from 'shared-lib/serverTime'
import { logout } from '../../lib/user'

export default function Settings() {
  return (
    <>
      <ServerTime />
      <FinancialData />
      <button type="button" onClick={logout}>
        Logout
      </button>
    </>
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
      Hora server: {pad(serverDate.hours)}:{pad(serverDate.minutes)}:{pad(serverDate.seconds)}
    </span>
  )
}
