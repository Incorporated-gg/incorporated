const mysql = require('../mysql')
const alliances = require('./alliances')
const { calcBuildingDailyIncome } = require('shared-lib/buildingsUtils')
const { researchList } = require('shared-lib/researchUtils')
const { personnelList } = require('shared-lib/personnelUtils')

module.exports.getData = async userID => {
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

module.exports.getUserDailyIncome = getUserDailyIncome
async function getUserDailyIncome(userID) {
  let [[buildingsRaw], [[optimizeResearchLevel]]] = await Promise.all([
    await mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [userID]),
    await mysql.query('SELECT level FROM research WHERE user_id=? AND id=5', [userID]),
  ])
  optimizeResearchLevel = optimizeResearchLevel ? optimizeResearchLevel.level : 0

  return buildingsRaw.reduce(
    (prev, curr) => prev + calcBuildingDailyIncome(curr.id, curr.quantity, optimizeResearchLevel),
    0
  )
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
