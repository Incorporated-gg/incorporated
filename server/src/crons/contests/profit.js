const mysql = require('../../lib/mysql')
const { getServerDate } = require('shared-lib/serverTime')

// Contest name has to be unique
const contestName = 'profit'
// Start every odd week on monday at 00:00
const shouldStartContest = () => {
  const serverDate = getServerDate()
  return (
    Math.floor(serverDate.day / 7) % 2 === 1 &&
    serverDate.day_of_the_week === 0 &&
    serverDate.hours === 0 &&
    serverDate.minutes === 0
  )
}
// End every odd week on sunday at 23:59
const shouldEndContest = () => {
  const serverDate = getServerDate()
  return (
    Math.floor(serverDate.day / 7) % 2 === 1 &&
    serverDate.day_of_the_week === 6 &&
    serverDate.hours === 23 &&
    serverDate.minutes === 59
  )
}

// Callback to be executed when the contest starts
const contestStart = () => {}

// Callback to be executed every time the contests cron gets called
const contestDidUpdate = () => {}

const contestWillUpdate = () => {}

// Callback to be executed once the contest ends
const contestEnd = () => {}

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
