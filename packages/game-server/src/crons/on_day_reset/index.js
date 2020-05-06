import { getServerDay, getInitialUnixTimestampOfServerDay } from '../../lib/serverTime'
import mysql from '../../lib/mysql'

import usersDailyLog from './users_daily_log'
import newspaper from './newspaper'
import allianceWars from './alliance_wars'
import contests from './contests'

export async function runOnce() {
  setTimeoutForStartOfTomorrow()

  // Catch up if server was down for a day change
  const serverDay = getServerDay()
  const last = await mysql.selectOne('SELECT MAX(day) as day FROM cron_day_changes_done')
  let day = last.day || 0

  while (day < serverDay - 1) {
    await runJustAfterNewDay(++day)
  }
}

function setTimeoutForStartOfTomorrow() {
  // Run every server day just after reset
  const tsStartOfTomorrow = getInitialUnixTimestampOfServerDay(getServerDay() + 1)

  setTimeout(() => {
    setTimeoutForStartOfTomorrow()
    const finishedServerDay = getServerDay() - 1
    runJustAfterNewDay(finishedServerDay)
  }, tsStartOfTomorrow - Date.now() + 10)
}

async function runJustAfterNewDay(finishedServerDay) {
  await mysql.query('INSERT INTO cron_day_changes_done (day) VALUES (?)', [finishedServerDay])

  try {
    await allianceWars(finishedServerDay)
  } catch (e) {
    console.error(e)
  }

  try {
    await usersDailyLog(finishedServerDay)
  } catch (e) {
    console.error(e)
  }

  try {
    await newspaper(finishedServerDay)
  } catch (e) {
    console.error(e)
  }

  try {
    await contests(finishedServerDay)
  } catch (e) {
    console.error(e)
  }
}
