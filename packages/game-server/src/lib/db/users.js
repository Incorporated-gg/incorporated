import { getAccountData } from '../accountInternalApi'
import { calculateMaxDailyReceivedAttacks } from 'shared-lib/missionsUtils'
import mysql from '../mysql'
import { parseMissionFromDB } from './missions'
import { getUserAllianceID, getAllianceBasicData } from './alliances'
import { researchList } from 'shared-lib/researchUtils'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import { getInitialUnixTimestampOfServerDay } from '../../lib/serverTime'
import { calcBuildingDailyIncome, buildingsList, calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { getUserResearchBonusFromHoods, getHoodBonusIncomeMultiplier } from './hoods'

export async function getUserData(userID) {
  const userDataPromise = mysql.selectOne('SELECT username FROM users WHERE id=?', [userID])
  const rankingDataPromise = mysql.selectOne('SELECT rank, points FROM ranking_income WHERE user_id=?', [userID])
  const alliancePromise = getUserAllianceID(userID).then(getAllianceBasicData)
  const accountDataPromise = getAccountData(userID)
  const researchsPromise = getUserResearchs(userID)

  const [userData, rankingData, allianceData, accountData, researchs] = await Promise.all([
    userDataPromise,
    rankingDataPromise,
    alliancePromise,
    accountDataPromise,
    researchsPromise,
  ])
  if (!userData || !accountData) return null

  const hoodResearchBonuses = await getUserResearchBonusFromHoods(allianceData.id)

  return {
    id: userID,
    username: userData.username,
    avatar: accountData.avatar,
    rank_position: rankingData ? rankingData.rank : 0,
    income: rankingData ? rankingData.points : 0,
    alliance: allianceData,
    spy_research_level: researchs[1] + hoodResearchBonuses.espionage,
  }
}

export async function getUserIDFromUsername(username) {
  const userData = await mysql.selectOne('SELECT id FROM users WHERE username=?', [username])
  return userData ? userData.id : null
}

export async function getUserPersonnelCosts(userID) {
  let personnelCost = 0
  const userPersonnel = await getUserPersonnel(userID)
  Object.entries(userPersonnel).forEach(([resourceID, quantity]) => {
    const personnelInfo = PERSONNEL_OBJ[resourceID]
    if (!personnelInfo) return
    const dailyCost = quantity * personnelInfo.dailyMaintenanceCost
    personnelCost += dailyCost
  })
  return personnelCost
}

export async function getUserDailyIncome(userID) {
  const allianceID = await getUserAllianceID(userID)
  let [buildingsRaw, researchs, incomeMultiplier] = await Promise.all([
    mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [userID]),
    getUserResearchs(userID),
    getHoodBonusIncomeMultiplier(allianceID),
  ])
  const optimizeResearchLevel = researchs[5]

  const totalBuildingsIncome = buildingsRaw.reduce(
    (prev, curr) => prev + calcBuildingDailyIncome(curr.id, curr.quantity, optimizeResearchLevel),
    0
  )

  return totalBuildingsIncome * incomeMultiplier
}

export async function getUserResearchs(userID, { includeResearchsInProgress = false } = {}) {
  const researchs = {}
  researchList.forEach(research => (researchs[research.id] = 1))

  const researchsRaw = await mysql.query('SELECT id, level FROM research WHERE user_id=?', [userID])
  researchsRaw.forEach(research => (researchs[research.id] = research.level))

  if (includeResearchsInProgress) {
    const activeResearchsRaw = await mysql.query('SELECT research_id FROM research_active WHERE user_id=?', [userID])
    activeResearchsRaw.forEach(research => researchs[research.research_id]++)
  }

  return researchs
}

export async function getUserPersonnel(userID) {
  const personnels = {
    guards: 0,
    sabots: 0,
    spies: 0,
    thieves: 0,
  }

  const personnelRaw = await mysql.query('SELECT resource_id, quantity FROM users_resources WHERE user_id=?', [userID])
  if (personnelRaw) personnelRaw.forEach(personnel => (personnels[personnel.resource_id] = personnel.quantity))

  return personnels
}

export async function getUserBuildings(userID) {
  const buildings = buildingsList.reduce((curr, building) => {
    curr[building.id] = {
      quantity: 0,
      money: 0,
    }
    return curr
  }, {})

  const buildingsRaw = await mysql.query('SELECT id, quantity, money FROM buildings WHERE user_id=?', [userID])
  buildingsRaw.forEach(building => {
    buildings[building.id].quantity = building.quantity
    buildings[building.id].money = parseInt(building.money)
  })
  return buildings
}

export async function getUserTodaysMissionsLimits(userID) {
  const dailyCountStartedAt = Math.floor(getInitialUnixTimestampOfServerDay() / 1000)
  const userDailyIncome = await getUserDailyIncome(userID)
  const maxDefenses = calculateMaxDailyReceivedAttacks(userDailyIncome)

  const [
    { receivedToday },
  ] = await mysql.query(
    "SELECT COUNT(*) AS receivedToday FROM missions WHERE target_user=? AND mission_type='attack' AND will_finish_at>=? AND completed=1",
    [userID, dailyCountStartedAt]
  )

  const { attacks_left: attacksLeft } = await mysql.selectOne('SELECT attacks_left from users WHERE id=?', [userID])

  return {
    receivedToday,
    attacksLeft,
    maxDefenses,
  }
}

export async function getAttacksTodayFromUserToAnotherUser(attackerID, defenderID) {
  const dailyCountStartedAt = Math.floor(getInitialUnixTimestampOfServerDay() / 1000)

  const [
    { receivedToday },
  ] = await mysql.query(
    "SELECT COUNT(*) AS receivedToday FROM missions WHERE user_id=? AND target_user=? AND mission_type='attack' AND will_finish_at>=? AND completed=1",
    [attackerID, defenderID, dailyCountStartedAt]
  )

  return receivedToday
}

export async function getHasActiveMission(userID) {
  const activeMissions = await mysql.query('SELECT 1 FROM missions WHERE user_id=? AND completed=0', [userID])

  return activeMissions.length > 0
}

export async function getActiveMission(userID) {
  const mission = await mysql.selectOne(
    'SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE user_id=? AND completed=0',
    [userID]
  )
  if (!mission) return null

  return await parseMissionFromDB(mission)
}

export async function sendMessage({ receiverID, senderID, type, data }) {
  if (type.length > 20) throw new Error("Type can't be longer than 20 chars")
  const messageCreatedAt = Math.floor(Date.now() / 1000)
  await mysql.query('INSERT INTO messages (user_id, sender_id, created_at, type, data) VALUES (?, ?, ?, ?, ?)', [
    receiverID,
    senderID,
    messageCreatedAt,
    type,
    JSON.stringify(data),
  ])
}

export async function getUnreadMessagesCount(userID) {
  const [
    { last_checked_messages_at: lastCheckedMessagesAt },
  ] = await mysql.query('SELECT last_checked_messages_at FROM users WHERE id=?', [userID])
  const [
    { count: unreadMessagesCount },
  ] = await mysql.query('SELECT COUNT(*) as count FROM messages WHERE user_id=? AND created_at>?', [
    userID,
    lastCheckedMessagesAt || 0,
  ])
  return unreadMessagesCount
}

export async function getUnreadReportsCount(userID) {
  let [
    { last_checked_reports_at: lastCheckedReportsAt },
  ] = await mysql.query('SELECT last_checked_reports_at FROM users WHERE id=?', [userID])
  lastCheckedReportsAt = lastCheckedReportsAt || 0

  const {
    count: notSeenSentCount,
  } = await mysql.selectOne(
    'SELECT COUNT(*) as count FROM missions WHERE completed=1 AND will_finish_at>=? AND user_id=?',
    [lastCheckedReportsAt, userID]
  )
  const {
    count: notSeenReceivedCount,
  } = await mysql.selectOne(
    'SELECT COUNT(*) as count FROM missions WHERE completed=1 AND will_finish_at>=? AND target_user=? AND (mission_type="attack" OR (mission_type="spy" AND result="caught"))',
    [lastCheckedReportsAt, userID]
  )

  return {
    total: notSeenReceivedCount + notSeenSentCount,
    notSeenReceivedCount,
    notSeenSentCount,
  }
}

export async function runUserMoneyUpdate(userID) {
  const [{ last_money_update: lastMoneyUpdate }] = await mysql.query('SELECT last_money_update FROM users WHERE id=?', [
    userID,
  ])
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const moneyUpdateElapsedS = currentTimestamp - lastMoneyUpdate
  if (moneyUpdateElapsedS < 1) return
  await mysql.query('UPDATE users SET last_money_update=? WHERE id=?', [currentTimestamp, userID])

  // Buildings Income
  const userResearchs = await getUserResearchs(userID)

  const buildings = await mysql.query('SELECT id, quantity, money FROM buildings WHERE user_id=?', [userID])
  const buildingsIncomes = buildings.map(building => ({
    ...building,
    money: parseFloat(building.money),
    income: calcBuildingDailyIncome(building.id, building.quantity, userResearchs[5]),
  }))

  await Promise.all(
    buildingsIncomes.map(async building => {
      const maxMoney = calcBuildingMaxMoney({
        buildingID: building.id,
        buildingAmount: building.quantity,
        bankResearchLevel: userResearchs[4],
      })
      if (building.money >= maxMoney.maxTotal) return

      const buildingRevenue = building.income
      let moneyGenerated = (buildingRevenue / 24 / 60 / 60) * moneyUpdateElapsedS
      const moneyOverTotal = Math.max(0, building.money + moneyGenerated - maxMoney.maxTotal)
      moneyGenerated = moneyGenerated - moneyOverTotal

      await mysql.query('UPDATE buildings SET money=money+? WHERE user_id=? AND id=?', [
        moneyGenerated,
        userID,
        building.id,
      ])
    })
  )

  // Personnel Costs
  const personnelCosts = ((await getUserPersonnelCosts(userID)) / 24 / 60 / 60) * moneyUpdateElapsedS
  await mysql.query('UPDATE users SET money=money-? WHERE id=?', [personnelCosts, userID])
}
