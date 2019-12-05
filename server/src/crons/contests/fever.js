const mysql = require('../../lib/mysql')

const date = new Date()
const getLastDayOfMonth = (y, m) => {
  return new Date(y, m + 1, 0).getDate()
}

// Contest name has to be unique
const contestName = 'fever'
// The first day of every month at 00:00
const shouldStartContest = date.getUTCDate() === 1 && date.getUTCHours() === 0 && date.getUTCMinutes() === 0
// The last day of every month at 23:59
const shouldEndContest =
  date.getUTCDate() === getLastDayOfMonth(date.getUTCFullYear(), date.getUTCMonth()) &&
  date.getUTCHours() === 23 &&
  date.getUTCMinutes() === 59

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

// Has to return an array of objects containing { score, user_id }
const getScoreboard = async () => {
  const [topAttackers] = await mysql.query(
    "SELECT SUM(gained_fame) AS score, user_id FROM missions WHERE completed=1 AND mission_type='attack' AND gained_fame IS NOT NULL GROUP BY user_id ORDER BY score DESC LIMIT 30"
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
