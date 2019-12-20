const mysql = require('../../lib/mysql')

// Contest name has to be unique
const contestName = 'spy'
// Start every even week on monday at 00:00
const shouldStartContest = () => {
  const date = new Date()
  return (
    (date.getUTCDate() / 7) % 2 === 0 &&
    date.getUTCDay() === 0 &&
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0
  )
}
// End every even week on sunday at 23:59
const shouldEndContest = () => {
  const date = new Date()
  return (
    (date.getUTCDate() / 7) % 2 === 0 &&
    date.getUTCDay() === 6 &&
    date.getUTCHours() === 23 &&
    date.getUTCMinutes() === 59
  )
}

// Callback to be executed when the contest starts
const contestStart = () => {
  console.log(`[INFO] Contest ${contestName} has started`)
}

// Callback to be executed every time the contests cron gets called
const contestDidUpdate = () => {
  console.log(`[INFO] Contest ${contestName} has been updated`)
}

const contestWillUpdate = () => {
  console.log(`[INFO] Contest ${contestName} will be updated`)
}

// Callback to be executed once the contest ends
const contestEnd = () => {
  console.log(`[INFO] Contest ${contestName} has ended`)
}

const getScoreboard = async startDate => {
  const [
    topSpies,
  ] = await mysql.query(
    "SELECT COUNT(id) AS score, user_id FROM missions WHERE completed=1 AND mission_type='spy' AND will_finish_at >= ? GROUP BY user_id ORDER BY score DESC LIMIT 30",
    [startDate]
  )
  return topSpies
}

module.exports = {
  contestName,
  getScoreboard,
  shouldStartContest,
  shouldEndContest,
  contestStart,
  contestDidUpdate,
  contestWillUpdate,
  contestEnd,
}
