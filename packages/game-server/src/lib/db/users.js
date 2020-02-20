import { getAccountUserData } from '../accountInternalApi'
const mysql = require('../mysql')
const alliances = require('./alliances')
const { parseMissionFromDB } = require('./missions')
const { researchList } = require('shared-lib/researchUtils')
const { personnelList } = require('shared-lib/personnelUtils')
const { getInitialUnixTimestampOfServerDay } = require('shared-lib/serverTime')
const { MAX_DAILY_ATTACKS, MAX_DAILY_DEFENSES, DAILY_DEFENSES_INCREASE } = require('shared-lib/missionsUtils')
const { calcBuildingDailyIncome, buildingsList, calcBuildingMaxMoney } = require('shared-lib/buildingsUtils')

module.exports.getData = getData
async function getData(userID) {
  const userDataPromise = mysql.selectOne('SELECT username FROM users WHERE id=?', [userID])
  const rankingDataPromise = mysql.selectOne('SELECT rank, points FROM ranking_income WHERE user_id=?', [userID])
  const alliancePromise = alliances.getUserAllianceID(userID).then(alliances.getBasicData)
  const accountDataPromise = getAccountUserData(userID)

  const [userData, rankingData, allianceData, accountData] = await Promise.all([
    userDataPromise,
    rankingDataPromise,
    alliancePromise,
    accountDataPromise,
  ])
  if (!userData) return null

  return {
    id: userID,
    username: userData.username,
    rank_position: rankingData ? rankingData.rank : 0,
    income: rankingData ? rankingData.points : 0,
    alliance: allianceData,
    accountData,
  }
}

module.exports.getIDFromUsername = async username => {
  const userData = await mysql.selectOne('SELECT id FROM users WHERE username=?', [username])
  return userData ? userData.id : null
}

module.exports.getUserPersonnelCosts = getUserPersonnelCosts
async function getUserPersonnelCosts(userID) {
  let personnelCost = 0
  const userPersonnel = await getPersonnel(userID)
  Object.entries(userPersonnel).forEach(([resourceID, quantity]) => {
    const personnelInfo = personnelList.find(p => p.resource_id === resourceID)
    if (!personnelInfo) return
    const dailyCost = quantity * personnelInfo.dailyMaintenanceCost
    personnelCost += dailyCost
  })
  return personnelCost
}

module.exports.getUserDailyIncome = getUserDailyIncome
export async function getUserDailyIncome(userID) {
  let [buildingsRaw, researchs] = await Promise.all([
    mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [userID]),
    getUserResearchs(userID),
  ])
  const optimizeResearchLevel = researchs[5]

  const totalBuildingsIncome = buildingsRaw.reduce(
    (prev, curr) => prev + calcBuildingDailyIncome(curr.id, curr.quantity, optimizeResearchLevel),
    0
  )

  return totalBuildingsIncome
}

export async function getUserResearchs(userID) {
  const researchs = {}
  researchList.forEach(research => (researchs[research.id] = 1))

  const researchsRaw = await mysql.query('SELECT id, level FROM research WHERE user_id=?', [userID])
  if (researchsRaw) researchsRaw.forEach(research => (researchs[research.id] = research.level))

  return researchs
}

export async function getPersonnel(userID) {
  const personnels = {}
  personnelList.forEach(personnel => (personnels[personnel.resource_id] = 0))

  const personnelRaw = await mysql.query('SELECT resource_id, quantity FROM users_resources WHERE user_id=?', [userID])
  if (personnelRaw) personnelRaw.forEach(personnel => (personnels[personnel.resource_id] = personnel.quantity))

  return personnels
}

export async function getTotalPersonnel(userID) {
  const personnels = await getPersonnel(userID)

  return personnels
}

export async function getBuildings(userID) {
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

export async function getMissions(userID) {
  let [
    { last_checked_reports_at: lastCheckedReportsAt },
  ] = await mysql.query('SELECT last_checked_reports_at FROM users WHERE id=?', [userID])
  lastCheckedReportsAt = lastCheckedReportsAt || 0

  const dailyCountStartedAt = Math.floor(getInitialUnixTimestampOfServerDay() / 1000)
  const sentMissionsRaw = await mysql.query(
    'SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE user_id=? ORDER BY will_finish_at DESC',
    [userID]
  )
  const receivedMissionsRaw = await mysql.query(
    'SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE target_user=? AND mission_type="attack" ORDER BY will_finish_at DESC',
    [userID]
  )
  const [
    { receivedToday },
  ] = await mysql.query(
    "SELECT COUNT(*) AS receivedToday FROM missions WHERE target_user=? AND mission_type='attack' AND started_at>? AND completed=1",
    [userID, dailyCountStartedAt]
  )
  const [
    { sentToday },
  ] = await mysql.query(
    "SELECT COUNT(*) AS sentToday FROM missions WHERE user_id=? AND mission_type='attack' AND started_at>? AND completed=1",
    [userID, dailyCountStartedAt]
  )
  const [sentMissions, receivedMissions] = await Promise.all([
    Promise.all(sentMissionsRaw.map(parseMissionFromDB)),
    Promise.all(receivedMissionsRaw.map(parseMissionFromDB)),
  ])
  const userMissionLimits = await getUserMissionLimits(userID)

  return {
    sent: sentMissions,
    received: receivedMissions,
    receivedToday,
    sentToday,
    lastCheckedReportsAt,
    ...userMissionLimits,
  }
}

export async function hasActiveMission(userID) {
  const activeMissions = await mysql.query('SELECT 1 FROM missions WHERE user_id=? AND completed=0', [userID])

  return activeMissions.length > 0
}

export async function getActiveMission(userID) {
  const activeMission = await mysql.selectOne('SELECT mission_type FROM missions WHERE user_id=? AND completed=0', [
    userID,
  ])

  if (!activeMission) return null

  return {
    mission_type: activeMission.mission_type,
  }
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

module.exports.getUnreadMessagesCount = getUnreadMessagesCount
async function getUnreadMessagesCount(userID) {
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

module.exports.getUnreadReportsCount = getUnreadReportsCount
async function getUnreadReportsCount(userID) {
  const [
    { last_checked_reports_at: lastCheckedReportsAt },
  ] = await mysql.query('SELECT last_checked_reports_at FROM users WHERE id=?', [userID])
  const [
    { count: unreadMissionsCount },
  ] = await mysql.query(
    'SELECT COUNT(*) as count FROM missions WHERE completed=1 AND will_finish_at>? AND (user_id=? OR (target_user=? AND mission_type="attack"))',
    [lastCheckedReportsAt || 0, userID, userID]
  )
  return unreadMissionsCount
}

module.exports.runUserMoneyUpdate = runUserMoneyUpdate
async function runUserMoneyUpdate(userID) {
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

module.exports.getUserMissionLimits = getUserMissionLimits
async function getUserMissionLimits(userID) {
  const userDailyIncome = await getUserDailyIncome(userID)
  return {
    maxAttacks: MAX_DAILY_ATTACKS,
    maxDefenses: MAX_DAILY_DEFENSES + Math.floor(userDailyIncome / DAILY_DEFENSES_INCREASE),
  }
}
