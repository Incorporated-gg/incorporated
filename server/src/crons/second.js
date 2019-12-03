const mysql = require('../lib/mysql')
const { calcularAtaque } = require('shared-lib/missionsUtils')
const { getResearchs, getPersonnel, getBuildings } = require('../lib/db/users')
const { timestampFromEpoch } = require('shared-lib/commonUtils')
const frequencyMs = 10 * 1000

const run = async () => {
  console.log(`${timestampFromEpoch()} Running second CRON`)
  // Missions
  const [missions] = await mysql.query(
    'SELECT id, user_id, target_user, target_building, mission_type, personnel_sent, started_at, will_finish_at, completed FROM missions'
  )
  const attackMissions = missions.filter(m => m.completed === 0).filter(m => m.mission_type === 'attack')
  if (!attackMissions.length) return
  attackMissions.forEach(async mission => {
    const curTime = Date.now() / 1000
    if (mission.will_finish_at > curTime) return
    // Complete the mission
    const [[defensor]] = await mysql.query('SELECT id FROM users WHERE id=?', [mission.target_user])
    const [[attacker]] = await mysql.query('SELECT id FROM users WHERE id=?', [mission.user_id])
    if (!defensor || !attacker) {
      console.error('O el defensor o el atacante ya no existen')
      return
    }
    const [defensorResearchs, defensorPersonnel, defensorBuildings] = await Promise.all([
      getResearchs(defensor.id),
      getPersonnel(defensor.id),
      getBuildings(defensor.id),
    ])
    const [attackerResearchs] = await Promise.all([getResearchs(attacker.id)])
    const attackParams = {
      defensorGuards: defensorPersonnel.guards,
      attackerSabots: parseInt(mission.personnel_sent),
      defensorSecurityLvl: defensorResearchs[3],
      attackerSabotageLvl: attackerResearchs[2],
      edificioID: parseInt(mission.target_building),
      defensorInfraLvl: defensorResearchs[6],
      defensorNumEdificios: defensorBuildings[parseInt(mission.target_building)],
    }
    console.log(attackParams)
    const attackResult = calcularAtaque(attackParams)

    console.log('ATTACK RESULT', JSON.stringify(attackResult))
    // Update troops
    await mysql.query('UPDATE users_resources SET quantity=? WHERE user_id=? AND resource_id=?', [
      attackResult.survivingGuards,
      defensor.id,
      'guards',
    ])
    await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? AND resource_id=?', [
      attackResult.survivingSabots,
      attacker.id,
      'sabots',
    ])

    // Update buildings
    await mysql.query('UPDATE buildings SET quantity=quantity-? WHERE user_id=? AND id=?', [
      attackResult.destroyedBuildings,
      defensor.id,
      mission.target_building,
    ])

    // Give money to attacker
    await mysql.query('UPDATE users SET money=money+?, last_money_update=? WHERE id=?', [
      attackResult.attackerTotalIncome,
      Date.now() / 1000,
      attacker.id,
    ])

    // Update mission state
    await mysql.query('UPDATE missions SET completed=1 WHERE id=?', [mission.id])
  })
}

module.exports = {
  run,
  frequencyMs,
}
