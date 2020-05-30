import tasksProgressHook from '../../../src/lib/db/tasks/tasksProgressHook'
import { sendAccountHook } from '../../../src/lib/accountInternalApi'
import mysql from '../../../src/lib/mysql'
import { getUserAllianceID, getAllianceResearchBonusFromBuffs } from '../../../src/lib/db/alliances'
import { simulateAttack } from 'shared-lib/simulateAttack'
import { getUserResearchs } from '../../../src/lib/db/users'
import { getHoodData, changeHoodGuards } from '../../../src/lib/db/hoods'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import { calcHoodMaxGuards } from 'shared-lib/hoodUtils'

export async function completeHoodAttackMission(mission) {
  const data = JSON.parse(mission.data)
  // Complete the mission
  const hoodData = await getHoodData(data.hood)
  const attacker = await mysql.selectOne('SELECT id FROM users WHERE id=?', [mission.user_id])

  if (!attacker || !hoodData || !hoodData.isAttackable) {
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
  const attackerSabotageLvl = attackerResearchs[2] + attackerResearchBonusFromBuffs.attack
  const defensorDefenseLvl = attackerSabotageLvl
  const defensorSecurityLvl = 1

  const buildingAmount = 0
  const unprotectedMoney = 0
  const guards = Math.floor(hoodData.guards)

  const { killedSabots, killedThieves, killedGuards, incomeForKilledTroops } = simulateAttack({
    buildingID: 1,
    defensorGuards: guards,
    attackerSabots: data.sabots,
    attackerThieves: data.thieves,
    attackerSabotageLvl,
    defensorDefenseLvl,
    defensorSecurityLvl,
    buildingAmount,
    unprotectedMoney,
  })
  const survivingGuards = guards - killedGuards

  const result = survivingGuards === 0 ? 'win' : 'lose'
  const gainedFame = 0
  const incomeFromConqueringHood = result === 'lose' ? 0 : 100 * calcHoodMaxGuards(hoodData.level)
  const attackerTotalIncome = incomeForKilledTroops + incomeFromConqueringHood
  const killedSabotsPrice = killedSabots * PERSONNEL_OBJ.sabots.price
  const realAttackerProfit = attackerTotalIncome - killedSabotsPrice

  // Update mission state
  const attackReport = {
    killed_guards: killedGuards,
    killed_sabots: killedSabots,
    killed_thieves: killedThieves,
    destroyed_buildings: 0,
    income_from_buildings: 0,
    income_from_troops: incomeForKilledTroops,
    income_from_robbed_money: 0,
    income_from_conquering_hood: incomeFromConqueringHood,
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
  if (result === 'win') {
    const tsNow = Math.floor(Date.now() / 1000)
    await mysql.query('UPDATE hoods SET owner=?, last_owner_change_at=? WHERE id=?', [
      attackerAllianceID,
      tsNow,
      hoodData.id,
    ])
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
