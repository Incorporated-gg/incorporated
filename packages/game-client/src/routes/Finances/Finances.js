import React, { useState, useEffect } from 'react'
import FinancialData from './FinancialData'
import api from '../../lib/api'
import styles from './Finances.module.scss'
import NotepadPage from 'components/UI/NotepadPage'

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
