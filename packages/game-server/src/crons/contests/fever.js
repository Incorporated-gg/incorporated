const mysql = require('../../lib/mysql')
const { getServerDate } = require('shared-lib/serverTime')

// Contest name has to be unique
const contestName = 'fever'
const getLastDayOfMonth = (year, monthWithBase1) => {
  return new Date(year, monthWithBase1, 0).getDate()
}
// The first day of every month at 00:00
const shouldStartContest = () => {
  const serverDate = getServerDate()
  return serverDate.day === 1 && serverDate.hours === 0 && serverDate.minutes === 0
}
// The last day of every month at 23:59
const shouldEndContest = () => {
  const serverDate = getServerDate()
  return (
    serverDate.day === getLastDayOfMonth(serverDate.year, serverDate.month) &&
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

// Has to return an array of objects containing { score, user_id }
const getScoreboard = async startDate => {
  const topAttackers = await mysql.query(
    "SELECT SUM(gained_fame) AS score, user_id FROM missions WHERE completed=1 AND mission_type='attack' AND will_finish_at >= ? AND gained_fame IS NOT NULL GROUP BY user_id ORDER BY score DESC LIMIT 30",
    [startDate]
  )
  return topAttackers
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
