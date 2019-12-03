const mysql = require('../lib/mysql')
const { simulateAttack } = require('shared-lib/missionsUtils')
const { getResearchs, getPersonnel, getBuildings } = require('../lib/db/users')
const frequencyMs = 10 * 1000

const run = async () => {
  // Missions
  await doAttackMissions()
}
module.exports = {
  run,
  frequencyMs,
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

async function doAttackMissions() {
  const curTime = Math.floor(Date.now() / 1000)
  const [
    attackMissions,
  ] = await mysql.query(
    'SELECT id, user_id, target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at, completed FROM missions WHERE completed=? AND mission_type=? AND will_finish_at<=?',
    [false, 'attack', curTime]
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

  // Update mission state
  await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])

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
