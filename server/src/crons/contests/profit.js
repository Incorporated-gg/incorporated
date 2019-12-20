const mysql = require('../../lib/mysql')

// Contest name has to be unique
const contestName = 'profit'
// Start every odd week on monday at 00:00
const shouldStartContest = () => {
  const date = new Date()
  return (
    (date.getUTCDate() / 7) % 2 === 1 &&
    date.getUTCDay() === 0 &&
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0
  )
}
// End every odd week on sunday at 23:59
const shouldEndContest = () => {
  const date = new Date()
  return (
    (date.getUTCDate() / 7) % 2 === 1 &&
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
    topProfiters,
  ] = await mysql.query(
    "SELECT SUM(profit) AS score, user_id FROM missions WHERE completed=1 AND mission_type='attack' AND will_finish_at >= ? GROUP BY user_id ORDER BY score DESC LIMIT 30",
    [startDate]
  )
  return topProfiters
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
