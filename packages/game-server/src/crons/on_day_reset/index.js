import { getServerDay, getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'
import usersDailyLog from './users_daily_log'
import newspaper from './newspaper'
import allianceWars from './alliance_wars'

export function runOnce() {
  setTimeoutForStartOfTomorrow()
}

function setTimeoutForStartOfTomorrow() {
  // Run every server day just after reset
  const tsStartOfTomorrow = getInitialUnixTimestampOfServerDay(getServerDay() + 1)

  setTimeout(() => {
    setTimeoutForStartOfTomorrow()
    runJustAfterNewDay()
  }, tsStartOfTomorrow - Date.now() + 100)
}

async function runJustAfterNewDay() {
  const finishedServerDay = getServerDay() - 1

  try {
    await allianceWars()
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
}
