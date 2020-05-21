import mysql from '../../src/lib/mysql'
import generateNewspaper from '../../src/lib/newspaper/generate_newspaper'

export default async function runJustAfterNewDay(finishedServerDay) {
  await generateAndUpdateDB(finishedServerDay)
}

async function generateAndUpdateDB(finishedServerDay) {
  const dailyNewspaper = await generateNewspaper(finishedServerDay)

  try {
    await mysql.query('INSERT INTO newspaper (day, data) VALUES (?, ?)', [
      finishedServerDay,
      JSON.stringify(dailyNewspaper),
    ])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      await mysql.query('UPDATE newspaper SET data=? WHERE day=?', [JSON.stringify(dailyNewspaper), finishedServerDay])
      return
    }
    throw err
  }
}
