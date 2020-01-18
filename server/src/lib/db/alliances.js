const mysql = require('../mysql')
const users = require('./users')
const { parseMissionFromDB } = require('./missions')
const { RESEARCHS_LIST, RESOURCES_LIST, calcResearchPrice } = require('shared-lib/allianceUtils')

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

module.exports.getIDFromShortName = async shortName => {
  const [[allianceData]] = await mysql.query('SELECT id FROM alliances WHERE short_name=?', [shortName])
  return allianceData ? allianceData.id : false
}

module.exports.getMembers = getMembers
async function getMembers(allianceID) {
  let [members] = await mysql.query('SELECT user_id, rank_name, is_admin FROM alliances_members WHERE alliance_id=?', [
    allianceID,
  ])
  members = await Promise.all(
    members.map(async member => ({
      user: await users.getData(member.user_id),
      rank_name: member.rank_name,
      is_admin: Boolean(member.is_admin),
    }))
  )
  members = members.sort((a, b) => (a.user.income > b.user.income ? -1 : 1))
  return members
}

module.exports.getResearchs = getResearchs
async function getResearchs(allianceID) {
  const [
    rawResearchs,
  ] = await mysql.query('SELECT id, level, progress_money FROM alliances_research WHERE alliance_id=?', [allianceID])
  const researchs = RESEARCHS_LIST.map(research => {
    const data = rawResearchs.find(raw => raw.id === research.id)
    const level = data ? data.level : 0
    return {
      id: research.id,
      level,
      price: calcResearchPrice(research.id, level),
      progress_money: data ? data.progress_money : 0,
    }
  }).reduce((prev, curr) => {
    prev[curr.id] = curr
    return prev
  }, {})
  return researchs
}

module.exports.getResources = getResources
async function getResources(allianceID) {
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
  return resources
}

module.exports.getMissionHistory = getMissionHistory
async function getMissionHistory(members = []) {
  const memberIDs = members.map(m => m.user.id)

  const activeMissionsQuery = mysql.query(
    'SELECT user_id, target_user, data, mission_type, started_at, will_finish_at FROM missions WHERE user_id IN (?) AND completed=0 ORDER BY will_finish_at DESC',
    [memberIDs]
  )
  const sentAttackMissionsQuery = mysql.query(
    "SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE user_id IN (?) AND mission_type='attack' AND completed=1 ORDER BY will_finish_at DESC LIMIT 30",
    [memberIDs]
  )
  const sentSpyMissionsQuery = mysql.query(
    "SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result FROM missions WHERE user_id IN (?) AND mission_type='spy' AND completed=1 ORDER BY will_finish_at DESC LIMIT 30",
    [memberIDs]
  )
  const receivedAttackMissionsQuery = mysql.query(
    "SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE target_user IN (?) AND mission_type='attack' AND completed=1 ORDER BY will_finish_at DESC LIMIT 30",
    [memberIDs]
  )
  const receivedSpyMissionsQuery = mysql.query(
    "SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result FROM missions WHERE target_user IN (?) AND mission_type='spy' AND completed=1 AND result='caught' ORDER BY will_finish_at DESC LIMIT 30",
    [memberIDs]
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
  const activeMissions = await Promise.all(activeMissionsRaw.map(parseMissionFromDB))
  const sentSpyMissions = await Promise.all(sentSpyMissionsRaw.map(parseMissionFromDB))
  const sentAttackMissions = await Promise.all(sentAttackMissionsRaw.map(parseMissionFromDB))
  const receivedSpyMissions = await Promise.all(receivedSpyMissionsRaw.map(parseMissionFromDB))
  const receivedAttackMissions = await Promise.all(receivedAttackMissionsRaw.map(parseMissionFromDB))
  return {
    active_missions: activeMissions,
    sent_attack_missions: sentAttackMissions,
    sent_spy_missions: sentSpyMissions,
    received_attack_missions: receivedAttackMissions,
    received_spy_missions: receivedSpyMissions,
  }
}

module.exports.getResourcesLog = getResourcesLog
async function getResourcesLog(allianceID) {
  const [
    rawLog,
  ] = await mysql.query(
    'SELECT user_id, created_at, resource_id, quantity FROM alliances_resources_log WHERE alliance_id=? ORDER BY created_at DESC LIMIT 20',
    [allianceID]
  )
  const resourcesLog = await Promise.all(
    rawLog.map(async raw => {
      return {
        user: await users.getData(raw.user_id),
        created_at: raw.created_at,
        resource_id: raw.resource_id,
        quantity: raw.quantity,
      }
    })
  )
  return resourcesLog
}

module.exports.getResearchShares = getResearchShares
async function getResearchShares(allianceID) {
  const [
    rawShares,
  ] = await mysql.query(
    'SELECT user_id, SUM(money) as total FROM alliances_research_log WHERE alliance_id=? GROUP BY user_id ORDER BY total DESC',
    [allianceID]
  )
  const researchShares = await Promise.all(
    rawShares.map(async raw => {
      return {
        user: await users.getData(raw.user_id),
        total: parseInt(raw.total),
      }
    })
  )
  return researchShares
}

module.exports.getBuffsData = getBuffsData
async function getBuffsData(allianceID) {
  const [
    [buffsLastUsed],
  ] = await mysql.query('SELECT buff_attack_last_used, buff_defense_last_used FROM alliances WHERE id=?', [allianceID])

  const now = Math.floor(Date.now() / 1000)

  return {
    attack: {
      active: now - buffsLastUsed.buff_attack_last_used < 60 * 60 * 2,
      can_activate: now - buffsLastUsed.buff_attack_last_used > 60 * 60 * 24 * 2,
      last_used: buffsLastUsed.buff_attack_last_used,
    },
    defense: {
      active: now - buffsLastUsed.buff_defense_last_used < 60 * 60 * 2,
      can_activate: now - buffsLastUsed.buff_defense_last_used > 60 * 60 * 24 * 2,
      last_used: buffsLastUsed.buff_defense_last_used,
    },
  }
}

module.exports.getResearchBonusFromBuffs = getResearchBonusFromBuffs
async function getResearchBonusFromBuffs(allianceID) {
  if (!allianceID) {
    return {
      2: 0,
      3: 0,
    }
  }
  const [buffsData, researchs] = await Promise.all([getBuffsData(allianceID), getResearchs(allianceID)])

  const bonusAttackLvls = buffsData.attack.active ? researchs[5].level + 1 : 0
  const bonusDefenseLvls = buffsData.defense.active ? researchs[6].level + 1 : 0

  return {
    2: bonusAttackLvls,
    3: bonusDefenseLvls,
  }
}

module.exports.getActiveWarBetweenAlliances = getActiveWarBetweenAlliances
async function getActiveWarBetweenAlliances(allianceID1, allianceID2) {
  const [
    [war],
  ] = await mysql.query(
    'SELECT id FROM alliances_wars WHERE completed=0 AND ((alliance1_id=? AND alliance2_id=?) OR (alliance2_id=? AND alliance1_id=?))',
    [allianceID1, allianceID2, allianceID1, allianceID2]
  )
  if (!war) return null

  return {
    id: war.id,
  }
}

module.exports.getAllianceActiveWars = getAllianceActiveWars
async function getAllianceActiveWars(allianceID) {
  let [
    activeWars,
  ] = await mysql.query(
    'SELECT id, created_at, alliance1_id, alliance2_id, data FROM alliances_wars WHERE completed=0 AND (alliance1_id=? OR alliance2_id=?) ORDER BY created_at DESC',
    [allianceID, allianceID]
  )
  activeWars = await Promise.all(activeWars.map(war => parseWar(allianceID, war)))

  return activeWars
}

module.exports.getAlliancePastWars = getAlliancePastWars
async function getAlliancePastWars(allianceID) {
  let [
    pastWars,
  ] = await mysql.query(
    'SELECT id, created_at, alliance1_id, alliance2_id, data FROM alliances_wars WHERE completed=1 AND (alliance1_id=? OR alliance2_id=?) ORDER BY created_at DESC LIMIT 10',
    [allianceID, allianceID]
  )
  pastWars = await Promise.all(pastWars.map(war => parseWar(allianceID, war)))

  return pastWars
}

async function parseWar(allianceID, war) {
  const combatantID = war.alliance1_id === allianceID ? war.alliance2_id : war.alliance1_id
  const combatant = await getBasicData(combatantID)
  return {
    id: war.id,
    created_at: war.created_at,
    data: JSON.parse(war.data),
    combatant,
  }
}
