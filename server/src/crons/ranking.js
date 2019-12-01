const mysql = require('../lib/mysql')
const frequencyMs = 15 * 1000 // Every 15s for dev purposes
const { calcBuildingIncomePerDay } = require('shared-lib/buildingsUtils')

const setUserIncome = async (userID, userIncome, rank) => {
  const [[rowExists]] = await mysql.query('SELECT 1 FROM ranking WHERE user_id = ?', [userID])
  if (!rowExists) {
    await mysql.query('INSERT INTO ranking (user_id, income, rank) VALUES (?, ?, ?)', [userID, userIncome, rank])
  } else {
    await mysql.query('UPDATE ranking SET income=?,rank=? WHERE user_id=?', [userIncome, rank, userID])
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
  const parsedUsers = await Promise.all(
    users.map(async user => {
      // Fetch the user's buildings
      const optimizeLvlPromise = mysql.query('SELECT level FROM research WHERE user_id=? AND id=5', [user.id])
      const userBuildingsPromise = mysql.query(
        `SELECT buildings.id, buildings.quantity FROM buildings
      LEFT OUTER JOIN users ON users.id = buildings.user_id
      WHERE users.id = ?`,
        [user.id]
      )
      const [[[optimizeLvlQuery]], [userBuildings]] = await Promise.all([optimizeLvlPromise, userBuildingsPromise])
      const optimizeLevel = optimizeLvlQuery ? optimizeLvlQuery.level : 0

      let userTotalIncome
      if (userBuildings.length) {
        // Calculate the total income
        userTotalIncome = userBuildings
          .map(({ id: buildingId, quantity }) => {
            return calcBuildingIncomePerDay(buildingId, quantity, optimizeLevel)
          })
          .reduce((buildingIncome, curValue) => {
            return buildingIncome + curValue
          })
      } else userTotalIncome = 0

      return {
        id: user.id,
        income: userTotalIncome,
      }
    })
  )

  await Promise.all(
    parsedUsers
      .sort((a, b) => (a.income < b.income ? 1 : -1))
      .map((user, index) => {
        setUserIncome(user.id, user.income, index + 1)
      })
  )
}

module.exports = {
  run,
  frequencyMs,
}
