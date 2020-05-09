import tasksProgressHook from '../../../lib/db/tasks/tasksProgressHook'
import { sendAccountHook } from '../../../lib/accountInternalApi'
import mysql from '../../../lib/mysql'
import { getUserAllianceID, getAllianceResearchBonusFromBuffs } from '../../../lib/db/alliances'
import { simulateAttack } from 'shared-lib/missionsUtils'
import { getUserResearchs } from '../../../lib/db/users'
import { getHoodData, changeHoodGuards } from '../../../lib/db/hoods'

export async function completeHoodAttackMission(mission) {
  const data = JSON.parse(mission.data)
  // Complete the mission
  const hoodData = await getHoodData(data.hood)
  const attacker = await mysql.selectOne('SELECT id FROM users WHERE id=?', [mission.user_id])
  if (!attacker || !hoodData || hoodData.owner) {
    // Either the attacker does not exist anymore, or the hood was already conquered
    await mysql.query('DELETE FROM missions WHERE id=?', [mission.id])
    return
  }

  // Get basic info and simulate attack
  const [attackerResearchs, attackerAllianceID] = await Promise.all([
    getUserResearchs(attacker.id),
    getUserAllianceID(attacker.id),
  ])

  const attackerResearchBonusFromBuffs = await getAllianceResearchBonusFromBuffs(attackerAllianceID)
  const attackerSabotageLevel = attackerResearchs[2] + attackerResearchBonusFromBuffs[2]
  const defenderSecurityLevel = attackerSabotageLevel
  const defenderInfraLevel = 1

  const buildingAmount = 0
  const unprotectedMoney = 0
  const guards = Math.floor(hoodData.guards)

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
  await mysql.query('UPDATE users SET attacks_left=attacks_left-1 WHERE id=?', [attacker.id])

  // Update troops
  await changeHoodGuards(hoodData.id, -killedGuards)

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
  if (hoodData.guards < 1) {
    await mysql.query('UPDATE hoods SET owner=? WHERE id=?', [attackerAllianceID, hoodData.id])
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
