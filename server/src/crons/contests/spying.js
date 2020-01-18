const mysql = require('../../lib/mysql')
const { getServerDate } = require('shared-lib/serverTime')

// Contest name has to be unique
const contestName = 'spy'
// Start every even week on monday at 00:00
const shouldStartContest = () => {
  const serverDate = getServerDate()
  return (
    Math.floor(serverDate.day / 7) % 2 === 0 &&
    serverDate.day_of_the_week === 0 &&
    serverDate.hours === 0 &&
    serverDate.minutes === 0
  )
}
// End every even week on sunday at 23:59
const shouldEndContest = () => {
  const serverDate = getServerDate()
  return (
    Math.floor(serverDate.day / 7) % 2 === 0 &&
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
