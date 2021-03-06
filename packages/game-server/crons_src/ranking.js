import mysql from '../src/lib/mysql'
import { getUserDailyIncome } from '../src/lib/db/users'
const frequencyMs = 5 * 60 * 1000

async function doIncomeRanking() {
  const users = await mysql.query('SELECT id FROM users')
  const parsedUsers = await Promise.all(
    users.map(async user => {
      // Fetch the user's income
      const userTotalIncome = await getUserDailyIncome(user.id)

      return {
        user_id: user.id,
        points: userTotalIncome,
      }
    })
  )

  await Promise.all(
    parsedUsers
      .sort((a, b) => (a.points < b.points ? 1 : -1))
      .map(async (user, index) => {
        const rank = index + 1
        const [rowExists] = await mysql.query('SELECT 1 FROM ranking_income WHERE user_id = ?', [user.user_id])
        if (!rowExists) {
          await mysql.query('INSERT INTO ranking_income (user_id, points, rank) VALUES (?, ?, ?)', [
            user.user_id,
            user.points,
            rank,
          ])
        } else {
          await mysql.query('UPDATE ranking_income SET points=?, rank=? WHERE user_id=?', [
            user.points,
            rank,
            user.user_id,
          ])
        }
      })
  )
}

async function doResearchRanking() {
  const researchs = await mysql.query('SELECT user_id, level FROM research')
  const parsedUsers = new Map()
  researchs.forEach(research => {
    let currPoints = 0
    if (parsedUsers.has(research.user_id)) {
      currPoints = parsedUsers.get(research.user_id)
    }
    parsedUsers.set(research.user_id, currPoints + research.level)
  })

  await Promise.all(
    Array.from(parsedUsers)
      .map(a => ({ user_id: a[0], points: a[1] }))
      .sort((a, b) => (a.points < b.points ? 1 : -1))
      .map(async (user, index) => {
        const rank = index + 1
        const [rowExists] = await mysql.query('SELECT 1 FROM ranking_research WHERE user_id = ?', [user.user_id])
        if (!rowExists) {
          await mysql.query('INSERT INTO ranking_research (user_id, points, rank) VALUES (?, ?, ?)', [
            user.user_id,
            user.points,
            rank,
          ])
        } else {
          await mysql.query('UPDATE ranking_research SET points=?, rank=? WHERE user_id=?', [
            user.points,
            rank,
            user.user_id,
          ])
        }
      })
  )
}

async function doAlliancesRanking() {
  const alliances = await mysql.query('SELECT id, server_points FROM alliances')

  await Promise.all(
    alliances
      .map(a => ({ alliance_id: a.id, points: a.server_points }))
      .sort((a, b) => (a.points < b.points ? 1 : -1))
      .map(async (alliance, index) => {
        const rank = index + 1
        const [rowExists] = await mysql.query('SELECT 1 FROM ranking_alliances WHERE alliance_id = ?', [
          alliance.alliance_id,
        ])
        if (!rowExists) {
          await mysql.query('INSERT INTO ranking_alliances (alliance_id, points, rank) VALUES (?, ?, ?)', [
            alliance.alliance_id,
            alliance.points,
            rank,
          ])
        } else {
          await mysql.query('UPDATE ranking_alliances SET points=?, rank=? WHERE alliance_id=?', [
            alliance.points,
            rank,
            alliance.alliance_id,
          ])
        }
      })
  )
}

const run = async () => {
  await Promise.all([doIncomeRanking(), doResearchRanking(), doAlliancesRanking()])
}

module.exports = {
  run,
  frequencyMs,
}
