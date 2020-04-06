import tasksProgressHook from '../../../lib/db/tasks/tasksProgressHook'
import { sendAccountHook } from '../../../lib/accountInternalApi'
import mysql from '../../../lib/mysql'
import { hoods } from '../../../lib/map'
const {
  getUserAllianceID,
  getResearchBonusFromBuffs,
  getBasicData: getAllianceBasicData,
} = require('../../../lib/db/alliances')
const { simulateAttack } = require('shared-lib/missionsUtils')
const { getUserResearchs } = require('../../../lib/db/users')

export async function completeHoodAttackMission(mission) {
  const data = JSON.parse(mission.data)
  // Complete the mission
  const hood = hoods.find(h => h.id === data.hood)
  const attacker = await mysql.selectOne('SELECT id FROM users WHERE id=?', [mission.user_id])
  if (!attacker || !hood || hood.owner) {
    // Either the attacker does not exist anymore, or the hood was already conquered
    await mysql.query('DELETE FROM missions WHERE id=?', [mission.id])
    return
  }

  // Get basic info and simulate attack
  const [attackerResearchs, attackerAllianceID] = await Promise.all([
    getUserResearchs(attacker.id),
    getUserAllianceID(attacker.id),
  ])

  const attackerResearchBonusFromBuffs = await getResearchBonusFromBuffs(attackerAllianceID)
  const attackerSabotageLevel = attackerResearchs[2] + attackerResearchBonusFromBuffs[2]
  const defenderSecurityLevel = attackerSabotageLevel
  const defenderInfraLevel = 1

  const buildingAmount = 0
  const unprotectedMoney = 0
  const guards = Math.floor(hood.guards)

  const {
    result,
    survivingSabots,
    survivingGuards,
    survivingThieves,
    gainedFame,
    incomeForKilledTroops,
    attackerTotalIncome,
    realAttackerProfit,
  } = simulateAttack({
    buildingID: 1,
    defensorGuards: guards,
    attackerSabots: data.sabots,
    attackerThieves: data.thieves,
    defensorSecurityLvl: defenderSecurityLevel,
    attackerSabotageLvl: attackerSabotageLevel,
    infraResearchLvl: defenderInfraLevel,
    buildingAmount,
    unprotectedMoney,
  })
  const killedSabots = data.sabots - survivingSabots
  const killedThieves = data.thieves - survivingThieves
  const killedGuards = guards - survivingGuards

  // Update mission state
  const attackReport = {
    killed_guards: killedGuards,
    killed_sabots: killedSabots,
    killed_thieves: killedThieves,
    destroyed_buildings: 0,
    income_from_buildings: 0,
    income_from_troops: incomeForKilledTroops,
    income_from_robbed_money: 0,
    attacker_total_income: attackerTotalIncome,
  }
  const attackData = JSON.stringify({
    ...data,
    report: attackReport,
  })
  await mysql.query('UPDATE missions SET completed=1, gained_fame=?, result=?, profit=?, data=? WHERE id=?', [
    gainedFame,
    result,
    realAttackerProfit,
    attackData,
    mission.id,
  ])

  // Update troops
  if (killedGuards > 0) {
    hood.guards -= killedGuards
    await mysql.query('UPDATE hoods SET guards=guards-? WHERE id=?', [killedGuards, hood.id])
  }

  if (killedSabots > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedSabots,
      attacker.id,
      'sabots',
    ])
  }
  if (killedThieves > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedThieves,
      attacker.id,
      'thieves',
    ])
  }

  // Update hood owner
  if (hood.guards < 1) {
    hood.owner = await getAllianceBasicData(attackerAllianceID)
    await mysql.query('UPDATE hoods SET owner=? WHERE id=?', [attackerAllianceID, hood.id])
  }

  // Give money to attacker
  await mysql.query('UPDATE users SET money=money+? WHERE id=?', [attackerTotalIncome, attacker.id])

  // Tasks hook
  await tasksProgressHook(attacker.id, 'attack_finished', {
    result,
    robbedMoney: 0,
  })
  sendAccountHook('attack_finished', { attackerID: attacker.id, defenderID: 0, result, isHoodAttack: true })
}
