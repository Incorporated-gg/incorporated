const mysql = require('../lib/mysql')
const frequencyMs = 15 * 1000 // Every 15s for dev purposes
const { calcBuildingIncomePerDay } = require('shared-lib/buildingsUtils')

const setUserIncome = async (userId, userIncome, exists) => {
  if (!exists) {
    try {
      await mysql.query('INSERT INTO ranking (user_id, income) VALUES (?, ?)', [userId, userIncome])
    } catch (error) {
      console.error('couldnt insert ranking')
    }
  } else {
    try {
      await mysql.query('UPDATE ranking SET income=? WHERE user_id=?', [userIncome, userId])
    } catch (error) {
      console.error('couldnt update ranking')
    }
  }
}

const run = async () => {
  const hora = (epoch = Date.now()) => {
    let d = new Date(epoch)
    let h = `${d.getHours()}`.padStart(2, '0')
    let m = `${d.getMinutes()}`.padStart(2, '0')
    let s = `${d.getSeconds()}`.padStart(2, '0')
    return `[${h}:${m}:${s}]`
  }
  console.log(`${hora()} Running update ranking CRON`)
  const [users] = await mysql.query('SELECT id FROM users')
  users.forEach(async user => {
    // Fetch the user's buildings
    const [
      userBuildings,
    ] = await mysql.query(
      'SELECT buildings.id, buildings.quantity, research.level AS optimizeLevel FROM buildings LEFT OUTER JOIN users ON users.id = buildings.user_id LEFT OUTER JOIN research ON users.id = research.user_id WHERE users.id = ?',
      [user.id]
    )

    let userTotalIncome
    if (userBuildings.length) {
      // Calculate the total income
      userTotalIncome = userBuildings
        .map(({ id: buildingId, quantity, optimizeLevel }) => {
          if (!optimizeLevel) optimizeLevel = 0
          return calcBuildingIncomePerDay(buildingId, quantity, optimizeLevel)
        })
        .reduce((buildingIncome, curValue) => {
          return buildingIncome + curValue
        })
    } else userTotalIncome = 0

    // Update user total income in ranking
    const [userRanking] = await mysql.query('SELECT income FROM ranking WHERE user_id = ?', [user.id])

    // User has no buildings. Still show him in ranking.
    setUserIncome(user.id, userTotalIncome, !!userRanking.length)
  })
}

module.exports = {
  run,
  frequencyMs,
}
