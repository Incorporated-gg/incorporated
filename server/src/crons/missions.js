const mysql = require('../lib/mysql')
const { simulateAttack } = require('shared-lib/missionsUtils')
const { getResearchs, getPersonnel, getBuildings } = require('../lib/db/users')
const frequencyMs = 10 * 1000

const run = async () => {
  // Missions
  const curTime = Math.floor(Date.now() / 1000)
  const [
    pendingMissions,
  ] = await mysql.query(
    'SELECT id, user_id, target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at, completed FROM missions WHERE completed=? AND will_finish_at<=?',
    [false, curTime]
  )

  await Promise.all(
    pendingMissions.map(async mission => {
      if (mission.mission_type === 'attack') await completeAttackMission(mission)
    })
  )
}

module.exports = {
  run,
  frequencyMs,
}

async function completeAttackMission(mission) {
  // Complete the mission
  const [[defender]] = await mysql.query('SELECT id FROM users WHERE id=?', [mission.target_user])
  const [[attacker]] = await mysql.query('SELECT id FROM users WHERE id=?', [mission.user_id])
  if (!defender || !attacker) {
    // Either the defender or attacker do not exist anymore
    await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])
    return
  }
  const [defensorResearchs, defensorPersonnel, defensorBuildings] = await Promise.all([
    getResearchs(defender.id),
    getPersonnel(defender.id),
    getBuildings(defender.id),
  ])
  const [attackerResearchs] = await Promise.all([getResearchs(attacker.id)])
  const attackParams = {
    defensorGuards: defensorPersonnel.guards,
    attackerSabots: parseInt(mission.personnel_sent),
    defensorSecurityLvl: defensorResearchs[3],
    attackerSabotageLvl: attackerResearchs[2],
    buildingID: parseInt(mission.target_building),
    defensorInfraLvl: defensorResearchs[6],
    defensorNumEdificios: defensorBuildings[parseInt(mission.target_building)],
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

  // Update troops
  await mysql.query('UPDATE users_resources SET quantity=? WHERE user_id=? AND resource_id=?', [
    survivingGuards,
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
  await mysql.query('UPDATE users SET money=money+?, last_money_update=? WHERE id=?', [
    attackerTotalIncome,
    Date.now() / 1000,
    attacker.id,
  ])

  // Update mission state
  await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])

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
  const messagesCreatedAt = Math.floor(Date.now() / 1000)
  const msgAttackReportEncoded = JSON.stringify(msgAttackReport)
  await mysql.query('INSERT INTO messages (user_id, sender_id, created_at, type, data) VALUES (?, ?, ?, ?, ?)', [
    attacker.id,
    null,
    messagesCreatedAt,
    'attack_report',
    msgAttackReportEncoded,
  ])
  await mysql.query('INSERT INTO messages (user_id, sender_id, created_at, type, data) VALUES (?, ?, ?, ?, ?)', [
    defender.id,
    null,
    messagesCreatedAt,
    'attack_report',
    msgAttackReportEncoded,
  ])
}
