import React, { useState, useEffect } from 'react'
import FinancialData from './FinancialData'
import { getServerDate, getServerDay } from 'shared-lib/serverTime'
import { logout } from '../../lib/user'
import api from '../../lib/api'

export default function Settings() {
  return (
    <>
      <ServerTime />
      <FinancialData />
      <DailyLogGraphs />
      <button type="button" onClick={logout}>
        Logout
      </button>
    </>
  )
}

function DailyLogGraphs() {
  const [dailyLog, setDailyLog] = useState()
  useEffect(() => {
    api
      .get('/v1/my_data/daily_log')
      .then(res => {
        setDailyLog(res.daily_log)
      })
      .catch(() => {})
  }, [])

  if (!dailyLog) return null

  const graphData = {
    labels: [],
    datasets: [{ label: 'Ingresos', data: [] }],
  }
  dailyLog.forEach(dayLog => {
    graphData.labels.push(dayLog.server_day)
    graphData.datasets[0].data.push(dayLog.daily_income)
  })

  return (
    <img
      style={{ width: '100%' }}
      src={`https://quickchart.io/chart?c={type:'bar',data:${JSON.stringify(graphData)}}`}
      alt="Gráfica de ingresos por día"
    />
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
