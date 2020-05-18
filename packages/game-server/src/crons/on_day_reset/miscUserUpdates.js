import mysql from '../../lib/mysql'
import { getAllHoodsData } from '../../lib/db/hoods'
import { getAllianceMembers } from '../../lib/db/alliances'
import { calcHoodDailyServerPoints } from 'shared-lib/hoodUtils'

export default async function runJustAfterNewDay(finishedServerDay) {
  await updateAttacksLeft()
  await updateUsersDailyLog(finishedServerDay)
  await giveHoodServerPoints()
}

const MAX_ACCUMULATED_ATTACKS = process.env.NODE_ENV === 'development' ? 60 : 6
const ATTACKS_GAINED_PER_DAY = process.env.NODE_ENV === 'development' ? 30 : 3

async function updateAttacksLeft() {
  await mysql.query('UPDATE users SET attacks_left=? WHERE attacks_left>=?', [
    MAX_ACCUMULATED_ATTACKS,
    MAX_ACCUMULATED_ATTACKS - ATTACKS_GAINED_PER_DAY,
  ])
  await mysql.query('UPDATE users SET attacks_left=attacks_left+? WHERE attacks_left<?', [
    ATTACKS_GAINED_PER_DAY,
    MAX_ACCUMULATED_ATTACKS - ATTACKS_GAINED_PER_DAY,
  ])
}

async function updateUsersDailyLog(finishedServerDay) {
  const users = await getAllUsers()
  await Promise.all(
    users.map(async user => {
      await mysql.query(
        'INSERT INTO users_daily_log (server_day, user_id, daily_income, researchs_count) VALUES (?, ?, ?, ?)',
        [finishedServerDay, user.user_id, user.daily_income, user.researchs_count]
      )
    })
  )
}

async function giveHoodServerPoints() {
  const allHoods = await getAllHoodsData()
  const usersAddedServerPoints = {}
  await Promise.all(
    allHoods.map(async hood => {
      if (!hood.owner) return
      const allianceMembers = await getAllianceMembers(hood.owner.id)
      allianceMembers.forEach(member => {
        if (!usersAddedServerPoints[member.user.id]) usersAddedServerPoints[member.user.id] = 0
        usersAddedServerPoints[member.user.id] += calcHoodDailyServerPoints(hood.tier)
      })
    })
  )

  await Promise.all(
    Object.entries(usersAddedServerPoints).map(([userID, pointsToAdd]) => {
      return mysql.query('UPDATE users SET server_points=server_points+? WHERE id=?', [pointsToAdd, userID])
    })
  )
}

async function getAllUsers() {
  const users = await mysql.query(
    'SELECT user_id, points, (SELECT SUM(level) FROM research WHERE user_id=ranking_income.user_id) as researchs_count FROM ranking_income'
  )
  return users.map(rankUser => ({
    user_id: rankUser.user_id,
    daily_income: rankUser.points || 0,
    researchs_count: rankUser.researchs_count || 0,
  }))
}
