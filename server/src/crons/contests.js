const mysql = require('../lib/mysql')
const frequencyMs = 60 * 1000

const fs = require('fs')
const path = require('path')

const getPreviousScoreboard = async contestID => {
  const [scoreBoard] = await mysql.query('SELECT user_id, score, rank FROM contests_scoreboards WHERE contest_id = ?', [
    contestID,
  ])
  return scoreBoard
}

const updateOngoingContest = async contest => {
  // Update scoreboards of ongoing contests
  const newScoreboardRaw = await contest.getScoreboard()
  const newScoreboard = newScoreboardRaw.map((row, rank) => {
    const score = row.score ? parseInt(row.score) : 0
    return {
      score: score,
      rank: rank + 1,
      user_id: row.user_id,
    }
  })
  const previousScoreboardRaw = await getPreviousScoreboard(contest.id)
  const previousScoreboard = previousScoreboardRaw.map(row => {
    const score = row.score ? parseInt(row.score) : 0
    return {
      score: score,
      rank: parseInt(row.rank),
      user_id: row.user_id,
    }
  })
  newScoreboard.forEach(async scoreboardRow => {
    const previousUserRecord = previousScoreboard.find(row => row.user_id === scoreboardRow.user_id)
    if (previousUserRecord) {
      if (previousUserRecord.score === scoreboardRow.score && previousUserRecord.rank === scoreboardRow.rank) {
        console.log(`User ${scoreboardRow.user_id} hasn't changed for contest ${contest.contestName}`)
        return
      }
      // The user stays in the scoreboards
      console.log(`Updating user ${scoreboardRow.user_id} in contest ${contest.contestName} scoreboards`)
      await mysql.query('UPDATE contests_scoreboards SET score = ?, rank = ? WHERE user_id = ? AND contest_id = ?', [
        scoreboardRow.score,
        scoreboardRow.rank,
        scoreboardRow.user_id,
        contest.contestName,
      ])
    } else {
      // The user has entered the scoreboards
      console.log(`Adding new user ${scoreboardRow.user_id} to contest ${contest.contestName} scoreboards`)
      await mysql.query('INSERT INTO contests_scoreboards (contest_id, user_id, score, rank) VALUES (?, ?, ?, ?)', [
        contest.id,
        scoreboardRow.user_id,
        scoreboardRow.score,
        scoreboardRow.rank,
      ])
    }
  })
  // Cleanup users that left the scoreboards
  const staleRows = previousScoreboard.filter(
    oldRow => !newScoreboard.find(newRow => newRow.user_id === oldRow.user_id)
  )
  staleRows.forEach(async staleRow => {
    console.log(`Removing stale user ${staleRow.user_id} from contest ${contest.contestName} scoreboards`)
    await mysql.query('DELETE FROM contests_scoreboards WHERE contest_id = ? AND user_id = ?', [
      contest.id,
      staleRow.user_id,
    ])
  })
}

const run = async () => {
  // Check cron dates and whether we need to run it or not
  const [ongoingContests] = await mysql.query(
    'SELECT id, name FROM contests WHERE started_at IS NOT NULL AND ended_at IS NULL'
  )

  const files = fs.readdirSync(path.join(__dirname, 'contests'))
  const contests = files.map(file => {
    const filePath = path.join(__dirname, 'contests', file)
    if (!fs.lstatSync(filePath).isFile()) return
    const cron = require(filePath)
    return cron
  })

  // Update ongoing contests
  ongoingContests.forEach(async contest => {
    const curContest = contests.find(c => c.contestName === contest.name)
    curContest.id = contest.id
    if (curContest.contestWillUpdate) curContest.contestWillUpdate()
    updateOngoingContest(curContest)
    if (curContest.contestDidUpdate) curContest.contestDidUpdate()
    // Check if we need to end ongoing contests
    if (curContest.shouldEndContest) {
      await mysql.query('UPDATE contests SET ended_at = ? WHERE id = ?', [Date.now() / 1000, contest.id])
      if (curContest.contestEnd) curContest.contestEnd()
    }
  })

  // Check if we need to start any contests
  const inactiveContests = contests.filter(
    contest => !ongoingContests.find(ongoingContest => ongoingContest.name === contest.contestName)
  )
  inactiveContests.forEach(async inactiveContest => {
    if (inactiveContest.shouldStartContest) {
      await mysql.query('INSERT INTO contests (name, started_at) VALUES (?, ?)', [
        inactiveContest.contestName,
        Date.now() / 1000,
      ])
      if (inactiveContest.contestStart) inactiveContest.contestStart()
    }
  })
}

module.exports = {
  run,
  frequencyMs,
}
