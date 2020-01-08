const mysql = require('../../../lib/mysql')
const { getUserAllianceID } = require('../../../lib/db/alliances')
const { simulateAttack } = require('shared-lib/missionsUtils')
const { getResearchs, getPersonnel, getBuildings, sendMessage } = require('../../../lib/db/users')

module.exports = {
  doAttackMissions,
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

async function doAttackMissions() {
  const tsNow = Math.floor(Date.now() / 1000)
  const [
    attackMissions,
  ] = await mysql.query(
    'SELECT id, user_id, target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at, completed FROM missions WHERE completed=? AND mission_type=? AND will_finish_at<=?',
    [false, 'attack', tsNow]
  )

  // Grouping by attacked user solves race conditions when many people are attacking the same user
  const attackedUsers = attackMissions.map(mission => mission.target_user).filter(onlyUnique)
  await Promise.all(
    attackedUsers.map(async attackedUserID => {
      const userMissions = attackMissions.filter(mission => mission.target_user === attackedUserID)
      for (const mission of userMissions) {
        await completeAttackMission(mission)
      }
    })
  )
}

async function completeAttackMission(mission) {
  // Complete the mission
  const [[[defender]], [[attacker]]] = await Promise.all([
    mysql.query('SELECT id FROM users WHERE id=?', [mission.target_user]),
    mysql.query('SELECT id FROM users WHERE id=?', [mission.user_id]),
  ])
  if (!defender || !attacker) {
    // Either the defender or attacker do not exist anymore
    await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])
    return
  }
  const [defensorResearchs, attackerResearchs, defensorPersonnel, defensorBuildings] = await Promise.all([
    getResearchs(defender.id),
    getResearchs(attacker.id),
    getPersonnel(defender.id),
    getBuildings(defender.id),
  ])
  const attackParams = {
    defensorGuards: defensorPersonnel.guards,
    attackerSabots: parseInt(mission.personnel_sent),
    defensorSecurityLvl: defensorResearchs[3],
    attackerSabotageLvl: attackerResearchs[2],
    buildingID: parseInt(mission.target_building),
    defensorInfraLvl: defensorResearchs[6],
    defensorNumEdificios: defensorBuildings[parseInt(mission.target_building)].quantity,
  }
  const {
    result,
    survivingSabots,
    survivingGuards,
    gainedFame,
    destroyedBuildings,
    incomeForDestroyedBuildings,
    incomeForKilledTroops,
    attackerTotalIncome,
    realAttackerProfit,
  } = simulateAttack(attackParams)

  // Update mission state
  await mysql.query('UPDATE missions SET completed=1, gained_fame=?, result=?, profit=? WHERE id=?', [
    gainedFame,
    result,
    realAttackerProfit,
    mission.id,
  ])

  // Update troops
  const allianceRestockGuards = await checkAllianceGuardsRestock(
    attackParams.defensorGuards,
    survivingGuards,
    defender.id
  )

  await mysql.query('UPDATE users_resources SET quantity=? WHERE user_id=? AND resource_id=?', [
    survivingGuards + allianceRestockGuards,
    defender.id,
    'guards',
  ])
  await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? AND resource_id=?', [
    survivingSabots,
    attacker.id,
    'sabots',
  ])

  // Update buildings
  await mysql.query('UPDATE buildings SET quantity=quantity-? WHERE user_id=? AND id=?', [
    destroyedBuildings,
    defender.id,
    mission.target_building,
  ])

  // Give money to attacker
  await mysql.query('UPDATE users SET money=money+? WHERE id=?', [attackerTotalIncome, attacker.id])

  // Send messages
  const msgAttackReport = {
    attacker_id: attacker.id,
    defender_id: defender.id,
    guards_killed: attackParams.defensorGuards - survivingGuards,
    sabots_killed: attackParams.attackerSabots - survivingSabots,
    building_id: attackParams.buildingID,
    result,
    surviving_sabots: survivingSabots,
    surviving_guards: survivingGuards,
    gained_fame: gainedFame,
    destroyed_buildings: destroyedBuildings,
    income_for_buildings: incomeForDestroyedBuildings,
    income_for_troops: incomeForKilledTroops,
    attacker_total_income: attackerTotalIncome,
    attacker_profit: realAttackerProfit,
  }
  await sendMessage({
    receiverID: attacker.id,
    senderID: null,
    type: 'attack_report',
    data: msgAttackReport,
  })
  await sendMessage({
    receiverID: defender.id,
    senderID: null,
    type: 'attack_report',
    data: msgAttackReport,
  })
}

async function checkAllianceGuardsRestock(defensorGuards, survivingGuards, defenderID) {
  const killedGuards = defensorGuards - survivingGuards
  if (killedGuards === 0) return 0
  const defenderAllianceID = await getUserAllianceID(defenderID)
  if (!defenderAllianceID) return 0

  const [
    [{ quantity: allianceGuardsCount }],
  ] = await mysql.query('SELECT quantity FROM alliances_resources WHERE alliance_id=? AND resource_id=?', [
    defenderAllianceID,
    'guards',
  ])
  if (Math.floor(allianceGuardsCount) === 0) return 0

  const restockedGuards = Math.min(Math.floor(allianceGuardsCount), killedGuards)
  await mysql.query('UPDATE alliances_resources SET quantity=quantity-? WHERE alliance_id=? AND resource_id=?', [
    restockedGuards,
    defenderAllianceID,
    'guards',
  ])
  return restockedGuards
}
