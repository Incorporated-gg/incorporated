const mysql = require('../../lib/mysql')
const date = new Date()

// Contest name has to be unique
const contestName = 'spy'
// Start every even week on monday at 00:00
const shouldStartContest =
  (date.getUTCDate() / 7) % 2 === 0 && date.getUTCDay() === 0 && date.getUTCHours() === 0 && date.getUTCMinutes() === 0
// End every even week on sunday at 23:59
const shouldEndContest =
  (date.getUTCDate() / 7) % 2 === 0 &&
  date.getUTCDay() === 6 &&
  date.getUTCHours() === 23 &&
  date.getUTCMinutes() === 59

const contestStart = () => {
  console.log(`contest ${contestName} has started`)
}

const contestUpdate = () => {
  console.log(`contest ${contestName} has been updated`)
}

const contestEnd = () => {
  console.log(`contest ${contestName} has ended`)
}

const getScoreboard = async () => {
  const [topspies] = await mysql.query(
    "SELECT COUNT(id) AS score, user_id FROM missions WHERE completed=1 AND mission_type='spy' GROUP BY user_id ORDER BY score DESC LIMIT 30"
  )
  return topspies
}

module.exports = {
  contestName,
  getScoreboard,
  shouldStartContest,
  shouldEndContest,
  contestStart,
  contestUpdate,
  contestEnd,
}
