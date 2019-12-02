const mysql = require('../mysql')
const users = require('./users')
const { RESEARCHS_LIST, RESOURCES_LIST } = require('shared-lib/allianceUtils')

module.exports.getUserAllianceID = getUserAllianceID
async function getUserAllianceID(userID) {
  const [[memberQuery]] = await mysql.query('SELECT alliance_id FROM alliances_members WHERE user_id=?', [userID])
  return memberQuery ? memberQuery.alliance_id : false
}

module.exports.getUserRank = getUserRank
async function getUserRank(userID) {
  const [
    [allianceMember],
  ] = await mysql.query('SELECT alliance_id, rank_name, is_admin FROM alliances_members WHERE user_id=?', [userID])
  if (!allianceMember) return false

  return {
    alliance_id: allianceMember.alliance_id,
    rank_name: allianceMember.rank_name,
    is_admin: allianceMember.is_admin,
  }
}

module.exports.getResearchPrice = getResearchPrice
function getResearchPrice(researchID, level) {
  const data = RESEARCHS_LIST.find(raw => raw.id === researchID)
  if (!data) return false
  const price = data.basePrice + data.priceIncreasePerLevel * level
  return price
}

module.exports.getBasicData = getBasicData
async function getBasicData(allianceID) {
  if (!allianceID) return false
  // Get basic alliance data
  const [
    [allianceQuery],
  ] = await mysql.query(
    'SELECT created_at, picture_url, long_name, short_name, description FROM alliances WHERE id=?',
    [allianceID]
  )

  return {
    id: allianceID,
    created_at: allianceQuery.created_at,
    picture_url: allianceQuery.picture_url,
    long_name: allianceQuery.long_name,
    short_name: allianceQuery.short_name,
    description: allianceQuery.description,
  }
}

module.exports.getPrivateData = getPrivateData
async function getPrivateData(allianceID) {
  if (!allianceID) return false
  // Get basic alliance data
  const basicData = await getBasicData(allianceID)
  if (!basicData) return false

  // Get members
  let [members] = await mysql.query('SELECT user_id, rank_name, is_admin FROM alliances_members WHERE alliance_id=?', [
    allianceID,
  ])
  members = await Promise.all(
    members.map(async member => {
      return {
        user: await users.getData(member.user_id),
        rank_name: member.rank_name,
        is_admin: member.is_admin,
      }
    })
  )

  // Get research data
  const [
    rawResearchs,
  ] = await mysql.query('SELECT id, level, progress_money FROM alliances_research WHERE alliance_id=?', [allianceID])
  const researchs = RESEARCHS_LIST.map(research => {
    const data = rawResearchs.find(raw => raw.id === research.id)
    const level = data ? data.level : 0
    return {
      id: research.id,
      level,
      price: getResearchPrice(research.id, level),
      progress_money: data ? data.progress_money : 0,
    }
  }).reduce((prev, curr) => {
    prev[curr.id] = curr
    return prev
  }, {})

  // Get resources
  const [rawResources] = await mysql.query(
    'SELECT resource_id, quantity FROM alliances_resources WHERE alliance_id=?',
    [allianceID]
  )
  const resources = RESOURCES_LIST.map(res => {
    const resData = rawResources.find(raw => raw.resource_id === res.resource_id)
    return {
      resource_id: res.resource_id,
      name: res.name,
      quantity: resData ? resData.quantity : 0,
    }
  }).reduce((prev, curr) => {
    prev[curr.resource_id] = curr
    return prev
  }, {})

  return {
    id: allianceID,
    created_at: basicData.created_at,
    picture_url: basicData.picture_url,
    long_name: basicData.long_name,
    short_name: basicData.short_name,
    description: basicData.description,
    members,
    researchs,
    resources,
  }
}