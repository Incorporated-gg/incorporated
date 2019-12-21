const mysql = require('../mysql')
const users = require('./users')
const { RESEARCHS_LIST, RESOURCES_LIST } = require('shared-lib/allianceUtils')

module.exports.MAX_MEMBERS = 10

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
    is_admin: Boolean(allianceMember.is_admin),
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

  if (!allianceQuery) return false

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
        is_admin: Boolean(member.is_admin),
      }
    })
  )
  members = members.sort((a, b) => (a.user.income > b.user.income ? -1 : 1))

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
      quantity: resData ? parseInt(resData.quantity) : 0,
    }
  }).reduce((prev, curr) => {
    prev[curr.resource_id] = curr
    return prev
  }, {})

  // Get mission history
  const activeMissionsQuery = mysql.query(
    'SELECT user_id, target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at FROM missions WHERE user_id IN (?) AND completed=0 ORDER BY will_finish_at DESC',
    [members.map(m => m.user.id)]
  )
  const sentAttackMissionsQuery = mysql.query(
    "SELECT user_id, target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at, completed, result, profit FROM missions WHERE user_id IN (?) AND mission_type='attack' AND completed=1 ORDER BY will_finish_at DESC LIMIT 30",
    [members.map(m => m.user.id)]
  )
  const sentSpyMissionsQuery = mysql.query(
    "SELECT user_id, target_user, mission_type, personnel_sent, started_at, will_finish_at, completed, result FROM missions WHERE user_id IN (?) AND mission_type='spy' AND completed=1 ORDER BY will_finish_at DESC LIMIT 30",
    [members.map(m => m.user.id)]
  )
  const receivedAttackMissionsQuery = mysql.query(
    "SELECT user_id, target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at, completed, result, profit FROM missions WHERE target_user IN (?) AND mission_type='attack' AND completed=1 ORDER BY will_finish_at DESC LIMIT 30",
    [members.map(m => m.user.id)]
  )
  const receivedSpyMissionsQuery = mysql.query(
    "SELECT user_id, target_user, mission_type, personnel_sent, started_at, will_finish_at, completed, result FROM missions WHERE target_user IN (?) AND mission_type='spy' AND completed=1 AND result='caught' ORDER BY will_finish_at DESC LIMIT 30",
    [members.map(m => m.user.id)]
  )
  const [
    [activeMissionsRaw],
    [sentAttackMissionsRaw],
    [sentSpyMissionsRaw],
    [receivedAttackMissionsRaw],
    [receivedSpyMissionsRaw],
  ] = await Promise.all([
    activeMissionsQuery,
    sentAttackMissionsQuery,
    sentSpyMissionsQuery,
    receivedAttackMissionsQuery,
    receivedSpyMissionsQuery,
  ])
  const activeMissions = await Promise.all(
    activeMissionsRaw.map(async mission => {
      const defensorData = await users.getData(mission.target_user)
      return {
        user_id: mission.user_id,
        target_user: defensorData,
        target_building: mission.target_building,
        mission_type: mission.mission_type,
        personnel_sent: mission.personnel_sent,
        started_at: mission.started_at,
        will_finish_at: mission.will_finish_at,
      }
    })
  )
  const sentSpyMissions = await Promise.all(
    sentSpyMissionsRaw.map(async mission => {
      const defensorData = await users.getData(mission.target_user)
      return {
        user_id: mission.user_id,
        target_user: defensorData,
        mission_type: mission.mission_type,
        personnel_sent: mission.personnel_sent,
        started_at: mission.started_at,
        will_finish_at: mission.will_finish_at,
        completed: mission.completed,
        result: mission.result,
      }
    })
  )
  const sentAttackMissions = await Promise.all(
    sentAttackMissionsRaw.map(async mission => {
      const defensorData = await users.getData(mission.target_user)
      return {
        user_id: mission.user_id,
        target_user: defensorData,
        target_building: mission.target_building,
        mission_type: mission.mission_type,
        personnel_sent: mission.personnel_sent,
        started_at: mission.started_at,
        will_finish_at: mission.will_finish_at,
        completed: mission.completed,
        result: mission.result,
        profit: mission.profit,
      }
    })
  )
  const receivedSpyMissions = await Promise.all(
    receivedSpyMissionsRaw.map(async mission => {
      const defensorData = await users.getData(mission.target_user)
      return {
        user_id: mission.user_id,
        target_user: defensorData,
        mission_type: mission.mission_type,
        personnel_sent: mission.personnel_sent,
        started_at: mission.started_at,
        will_finish_at: mission.will_finish_at,
        completed: mission.completed,
        result: mission.result,
      }
    })
  )
  const receivedAttackMissions = await Promise.all(
    receivedAttackMissionsRaw.map(async mission => {
      const defensorData = await users.getData(mission.target_user)
      return {
        user_id: mission.user_id,
        target_user: defensorData,
        target_building: mission.target_building,
        mission_type: mission.mission_type,
        personnel_sent: mission.personnel_sent,
        started_at: mission.started_at,
        will_finish_at: mission.will_finish_at,
        completed: mission.completed,
        result: mission.result,
        profit: mission.profit,
      }
    })
  )

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
    active_missions: activeMissions,
    sent_attack_missions: sentAttackMissions,
    sent_spy_missions: sentSpyMissions,
    received_attack_missions: receivedAttackMissions,
    received_spy_missions: receivedSpyMissions,
  }
}

module.exports.getIDFromShortName = async shortName => {
  const [[allianceData]] = await mysql.query('SELECT id FROM alliances WHERE short_name=?', [shortName])
  return allianceData ? allianceData.id : false
}
