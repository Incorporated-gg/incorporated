import mysql from '../../src/lib/mysql'
import { getAllHoodsData } from '../../src/lib/db/hoods'
import { getAllianceMembers } from '../../src/lib/db/alliances'
import { calcHoodDailyServerPoints } from 'shared-lib/hoodUtils'
import { getUserResearchs } from '../../src/lib/db/users'
import { calcResearchPrice } from 'shared-lib/allianceUtils'
import { MAX_ACCUMULATED_ATTACKS } from 'shared-lib/missionsUtils'

export default async function runJustAfterNewDay(finishedServerDay) {
  await updateAttacksLeft()
  await updateUsersDailyLog(finishedServerDay)
  await giveHoodServerPoints()
}

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
  const users = await getAllUsersAndTheirInfo()
  await Promise.all(
    users.map(async user => {
      await mysql.query(
        'INSERT INTO users_daily_log (server_day, user_id, daily_income, researchs_count, researchs_total_spending) VALUES (?, ?, ?, ?, ?)',
        [finishedServerDay, user.user_id, user.daily_income, user.researchs_count, user.researchs_total_spending]
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

async function getAllUsersAndTheirInfo() {
  const users = await mysql.query('SELECT user_id, points FROM ranking_income')
  return await Promise.all(
    users.map(async rankUser => {
      const researchs = await getUserResearchs(rankUser.user_id, { includeResearchsInProgress: true })
      const researchsCount = Object.values(researchs).reduce((prev, curr) => prev + curr, 0)
      const researchsTotalSpending = calcUserResearchsTotalSpending(researchs)

      return {
        user_id: rankUser.user_id,
        daily_income: rankUser.points || 0,
        researchs_count: researchsCount,
        researchs_total_spending: researchsTotalSpending,
      }
    })
  )
}

export function calcUserResearchsTotalSpending(researchs) {
  const researchsTotalSpending = Object.entries(researchs)
    .map(([resID, resLvl]) => {
      let totalPrice = 0n
      for (let k = 1; k < resLvl; k++) {
        totalPrice += BigInt(calcResearchPrice(resID, k))
      }
      return totalPrice
    })
    .reduce((prev, curr) => prev + curr, 0n)
  return researchsTotalSpending
}
