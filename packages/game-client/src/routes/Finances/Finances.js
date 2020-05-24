import React, { useState, useEffect } from 'react'
import FinancialData from './FinancialData'
import api from '../../lib/api'
import styles from './Finances.module.scss'
import NotepadPage from 'components/UI/notepad-page'
import { Bar } from 'react-chartjs-2'

export default function Finances() {
  return (
    <NotepadPage className={styles.container}>
      <FinancialData />
      <DailyLogGraphs />
    </NotepadPage>
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
    datasets: [{ label: 'Ingresos', data: [], backgroundColor: 'rgb(238, 207, 130)' }],
  }
  dailyLog.forEach(dayLog => {
    graphData.labels.push(`Día ${dayLog.server_day}`)
    graphData.datasets[0].data.push(dayLog.daily_income)
  })

  return (
    <div style={{ marginTop: 20 }}>
      <Bar
        data={graphData}
        options={{
          legend: false,
        }}
      />
    </div>
  )
}
