import mysql from '../lib/mysql'
import generateNewspaper from '../lib/newspaper/generate_newspaper'
import { getServerDay, getInitialUnixTimestampOfServerDay } from 'shared-lib/serverTime'

async function runOnce() {
  // generateAndUpdateDB(getServerDay()) // FOR DEVELOPMENT

  // Run every server day just after reset
  const tsStartOfTomorrow = getInitialUnixTimestampOfServerDay(getServerDay() + 1)

  setTimeout(() => {
    runOnce()
    runJustAfterNewDay()
  }, tsStartOfTomorrow - Date.now() + 2000)
}

module.exports = {
  runOnce,
}

async function runJustAfterNewDay() {
  const serverDay = getServerDay() - 1
  await generateAndUpdateDB(serverDay)
}

async function generateAndUpdateDB(serverDay) {
  const dailyNewspaper = await generateNewspaper(serverDay)

  try {
    await mysql.query('INSERT INTO newspaper (day, data) VALUES (?, ?)', [serverDay, JSON.stringify(dailyNewspaper)])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      await mysql.query('UPDATE newspaper SET data=? WHERE day=?', [JSON.stringify(dailyNewspaper), serverDay])
      return
    }
    throw err
  }
}
