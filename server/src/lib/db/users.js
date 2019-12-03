const mysql = require('../mysql')
const alliances = require('./alliances')
const { calcBuildingDailyIncome } = require('shared-lib/buildingsUtils')
const { researchList } = require('shared-lib/researchUtils')
const { personnelList } = require('shared-lib/personnelUtils')
const { buildingsList } = require('shared-lib/buildingsUtils')
const { taxList, getIncomeTaxes } = require('shared-lib/taxes')

module.exports.getData = getData
async function getData(userID) {
  const userDataPromise = mysql.query('SELECT username FROM users WHERE id=?', [userID])
  const rankingDataPromise = mysql.query('SELECT rank, income FROM ranking WHERE user_id=?', [userID])
  const alliancePromise = alliances.getUserAllianceID(userID).then(alliances.getBasicData)
  const [[[userData]], [[rankingData]], allianceData] = await Promise.all([
    userDataPromise,
    rankingDataPromise,
    alliancePromise,
  ])
  if (!userData) return false

  return {
    id: userID,
    username: userData.username,
    rank_position: rankingData ? rankingData.rank : 0,
    income: rankingData ? rankingData.income : 0,
    alliance: allianceData,
  }
}

module.exports.getIDFromUsername = async username => {
  const [[userData]] = await mysql.query('SELECT id FROM users WHERE username=?', [username])
  return userData ? userData.id : false
}

module.exports.getUserDailyIncome = getUserDailyIncome
async function getUserDailyIncome(userID, { withoutExpensesOrTaxes = false } = {}) {
  let [[buildingsRaw], [[optimizeResearchLevel]]] = await Promise.all([
    await mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [userID]),
    await mysql.query('SELECT level FROM research WHERE user_id=? AND id=5', [userID]),
  ])
  optimizeResearchLevel = optimizeResearchLevel ? optimizeResearchLevel.level : 0

  const totalBuildingsIncome = buildingsRaw.reduce(
    (prev, curr) => prev + calcBuildingDailyIncome(curr.id, curr.quantity, optimizeResearchLevel),
    0
  )

  let totalRevenue = totalBuildingsIncome
  if (!withoutExpensesOrTaxes) {
    // Taxes
    let taxesPercent = getIncomeTaxes(totalBuildingsIncome)
    const hasAlliance = await alliances.getUserAllianceID(userID)
    if (hasAlliance) taxesPercent += taxList.alliance
    const taxesCost = totalBuildingsIncome * taxesPercent

    // Personnel maintenance
    let personnelCost = 0
    const userPersonnel = await getPersonnel(userID)
    Object.entries(userPersonnel).forEach(([resourceID, quantity]) => {
      const personnelInfo = personnelList.find(p => p.resource_id === resourceID)
      if (!personnelInfo) return
      const dailyCost = quantity * personnelInfo.dailyMaintenanceCost
      personnelCost += dailyCost
    })

    totalRevenue = totalBuildingsIncome - taxesCost - personnelCost
  }

  return totalRevenue
}

module.exports.getResearchs = getResearchs
async function getResearchs(userID) {
  const researchs = {}
  researchList.forEach(research => (researchs[research.id] = 0))

  const [researchsRaw] = await mysql.query('SELECT id, level FROM research WHERE user_id=?', [userID])
  if (researchsRaw) researchsRaw.forEach(research => (researchs[research.id] = research.level))

  return researchs
}

module.exports.getPersonnel = getPersonnel
async function getPersonnel(userID) {
  const personnels = {}
  personnelList.forEach(personnel => (personnels[personnel.resource_id] = 0))

  const [personnelRaw] = await mysql.query('SELECT resource_id, quantity FROM users_resources WHERE user_id=?', [
    userID,
  ])
  if (personnelRaw) personnelRaw.forEach(personnel => (personnels[personnel.resource_id] = personnel.quantity))

  return personnels
}

module.exports.getBuildings = getBuildings
async function getBuildings(userID) {
  const buildings = {}
  buildingsList.forEach(building => (buildings[building.id] = 0))
  const [buildingsRaw] = await mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [userID])
  if (buildingsRaw) buildingsRaw.forEach(building => (buildings[building.id] = building.quantity))

  return buildings
}

module.exports.getMissions = getMissions
async function getMissions(userID) {
  const [
    missionsRaw,
  ] = await mysql.query(
    'SELECT target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at, completed FROM missions WHERE user_id=?',
    [userID]
  )
  const missions = Promise.all(
    missionsRaw.map(async mission => {
      const defensorData = await getData(mission.target_user)
      return {
        target_user: defensorData,
        target_building: mission.target_building,
        mission_type: mission.mission_type,
        personnel_sent: mission.personnel_sent,
        started_at: mission.started_at,
        will_finish_at: mission.will_finish_at,
        completed: mission.completed,
      }
    })
  )

  return missions
}
