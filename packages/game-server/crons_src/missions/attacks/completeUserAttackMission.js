import tasksProgressHook from '../../../src/lib/db/tasks/tasksProgressHook'
import { sendAccountHook } from '../../../src/lib/accountInternalApi'
import mysql from '../../../src/lib/mysql'
import {
  getUserResearchs,
  getUserPersonnel,
  getUserBuildings,
  sendMessage,
  runUserMoneyUpdate,
  getUserTodaysMissionsLimits,
} from '../../../src/lib/db/users'
import {
  getUserAllianceID,
  getAllianceResearchBonusFromBuffs,
  getActiveWarBetweenAlliances,
} from '../../../src/lib/db/alliances'
import { calcBuildingMaxMoney } from 'shared-lib/buildingsUtils'
import { simulateAttack } from 'shared-lib/missionsUtils'
import { onNewWarAttack } from '../../on_day_reset/alliance_wars'
import { allianceUpdateResource } from '../../../src/lib/db/alliances/resources'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'

export async function completeUserAttackMission(mission) {
  const data = JSON.parse(mission.data)
  // Complete the mission
  const [defender, attacker] = await Promise.all([
    mysql.selectOne('SELECT id FROM users WHERE id=?', [mission.target_user]),
    mysql.selectOne('SELECT id FROM users WHERE id=?', [mission.user_id]),
  ])
  if (!defender || !attacker) {
    // Either the defender or attacker do not exist anymore
    await mysql.query('DELETE FROM missions WHERE id=?', [mission.id])
    return
  }

  // Run money update for defender, so buildings money info is correct
  await runUserMoneyUpdate(defender.id)

  // Get basic info and simulate attack
  const [
    attackerResearchs,
    attackerAllianceID,
    defenderResearchs,
    defenderPersonnel,
    defenderBuildings,
    defenderAllianceID,
    defenderMissionLimits,
  ] = await Promise.all([
    getUserResearchs(attacker.id),
    getUserAllianceID(attacker.id),
    getUserResearchs(defender.id),
    getUserPersonnel(defender.id),
    getUserBuildings(defender.id),
    getUserAllianceID(defender.id),
    getUserTodaysMissionsLimits(defender.id),
  ])

  if (defenderMissionLimits.receivedToday >= defenderMissionLimits.maxDefenses) {
    // User has received max attacks before the attack could be completed. Cancel attacks and inform attackers about it
    await mysql.query('DELETE FROM missions WHERE id=?', [mission.id])
    await sendMessage({
      receiverID: attacker.id,
      senderID: null,
      type: 'attack_cancelled',
      data: {
        target_user_id: defender.id,
      },
    })
    return false
  }

  const [attackerResearchBonusFromBuffs, defenderResearchBonusFromBuffs] = await Promise.all([
    getAllianceResearchBonusFromBuffs(attackerAllianceID),
    getAllianceResearchBonusFromBuffs(defenderAllianceID),
  ])
  const attackerSabotageLevel = attackerResearchs[2] + attackerResearchBonusFromBuffs[2]
  const defenderSecurityLevel = defenderResearchs[3] + defenderResearchBonusFromBuffs[3]
  const defenderBankLevel = defenderResearchs[4]
  const defenderInfraLevel = defenderResearchs[6]

  const buildingAmount = defenderBuildings[data.building].quantity
  const maxMoney = calcBuildingMaxMoney({
    buildingID: data.building,
    buildingAmount,
    bankResearchLevel: defenderBankLevel,
  })
  const storedMoney = Math.floor(defenderBuildings[data.building].money)
  const unprotectedMoney = Math.max(0, storedMoney - maxMoney.maxSafe)

  const {
    result,
    survivingSabots,
    survivingGuards,
    survivingThieves,
    gainedFame,
    destroyedBuildings,
    incomeForDestroyedBuildings,
    incomeForKilledTroops,
    attackerTotalIncome,
    realAttackerProfit,
    robbedMoney,
  } = simulateAttack({
    defensorGuards: defenderPersonnel.guards,
    attackerSabots: data.sabots,
    attackerThieves: data.thieves,
    defensorSecurityLvl: defenderSecurityLevel,
    attackerSabotageLvl: attackerSabotageLevel,
    buildingID: data.building,
    infraResearchLvl: defenderInfraLevel,
    buildingAmount,
    unprotectedMoney,
  })
  const killedSabots = data.sabots - survivingSabots
  const killedThieves = data.thieves - survivingThieves
  const killedGuards = defenderPersonnel.guards - survivingGuards

  // Update mission state
  const attackReport = {
    killed_guards: killedGuards,
    killed_sabots: killedSabots,
    killed_thieves: killedThieves,
    destroyed_buildings: destroyedBuildings,
    income_from_buildings: incomeForDestroyedBuildings,
    income_from_troops: incomeForKilledTroops,
    income_from_robbed_money: robbedMoney,
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

  // Give money to attacker
  await mysql.query('UPDATE users SET money=money+? WHERE id=?', [attackerTotalIncome, attacker.id])

  // Update troops
  await updateTroops({
    data,
    attacker,
    defender,
    defenderAllianceID,
    killedGuards,
    killedSabots,
    killedThieves,
  })

  // Update buildings
  await mysql.query('UPDATE buildings SET quantity=quantity-?, money=money-? WHERE user_id=? AND id=?', [
    destroyedBuildings,
    robbedMoney,
    defender.id,
    data.building,
  ])

  // Update war data if there's one
  await checkAndUpdateActiveWar(attackerAllianceID, defenderAllianceID)

  // Tasks hook
  await tasksProgressHook(attacker.id, 'attack_finished', {
    result,
    robbedMoney,
  })
  sendAccountHook('attack_finished', {
    attackerID: attacker.id,
    defenderID: defender.id,
    result,
    isHoodAttack: false,
    robbedMoney,
  })
}

async function checkAndUpdateActiveWar(attackerAllianceID, defenderAllianceID) {
  const activeWar = await getActiveWarBetweenAlliances(attackerAllianceID, defenderAllianceID)
  if (activeWar) onNewWarAttack(activeWar.id)
}

async function updateTroops({
  data,
  attacker,
  defender,
  defenderAllianceID,
  killedGuards,
  killedSabots,
  killedThieves,
}) {
  // Replenish defender guards
  const replenishedGuards = await getAllianceGuardsReplenish(killedGuards, defender.id, defenderAllianceID)
  const killedGuardsAfterReplenishment = killedGuards - replenishedGuards
  if (killedGuardsAfterReplenishment > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedGuardsAfterReplenishment,
      defender.id,
      'guards',
    ])
  }

  // Buy attacker troops back, with all of the available money
  let userMoney = await mysql.selectOne('SELECT money FROM users WHERE id=?', [attacker.id])
  userMoney = parseInt(userMoney.money)

  const attackerTroopsDiff = {
    sabots: -killedSabots,
    thieves: -killedThieves,
  }

  if (data.rebuyLostTroops) {
    const reboughtSabots = Math.min(killedSabots, userMoney / PERSONNEL_OBJ.sabots.price)
    if (reboughtSabots > 0) {
      attackerTroopsDiff.sabots += reboughtSabots
      const price = reboughtSabots * PERSONNEL_OBJ.sabots.price
      userMoney -= price
      await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, attacker.id])
    }
    const reboughtThieves = Math.min(killedThieves, userMoney / PERSONNEL_OBJ.thieves.price)
    if (reboughtThieves > 0) {
      attackerTroopsDiff.thieves += reboughtThieves
      const price = reboughtThieves * PERSONNEL_OBJ.thieves.price
      userMoney -= price
      await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, attacker.id])
    }
  }

  // Return attacker troops to alliance
  const attackerPersonnel = await getUserPersonnel(attacker.id)

  const returnedSabots = Math.min(data.sabotsExtractedFromCorp, attackerPersonnel.sabots + attackerTroopsDiff.sabots)
  if (returnedSabots > 0) {
    await allianceUpdateResource({
      type: 'deposit',
      resourceID: 'sabots',
      resourceDiff: returnedSabots,
      userID: attacker.id,
    })
    attackerTroopsDiff.sabots -= returnedSabots
  }
  const returnedThieves = Math.min(
    data.thievesExtractedFromCorp,
    attackerPersonnel.thieves + attackerTroopsDiff.thieves
  )
  if (returnedThieves > 0) {
    await allianceUpdateResource({
      type: 'deposit',
      resourceID: 'thieves',
      resourceDiff: returnedThieves,
      userID: attacker.id,
    })
    attackerTroopsDiff.thieves -= returnedThieves
  }

  // Update attacker troops in DB
  if (attackerTroopsDiff.sabots !== 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? AND resource_id=?', [
      attackerTroopsDiff.sabots,
      attacker.id,
      'sabots',
    ])
  }
  if (attackerTroopsDiff.thieves !== 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? AND resource_id=?', [
      attackerTroopsDiff.thieves,
      attacker.id,
      'thieves',
    ])
  }
}

async function getAllianceGuardsReplenish(killedGuards, defenderID, defenderAllianceID) {
  if (killedGuards === 0) return 0
  if (!defenderAllianceID) return 0

  let [
    { quantity: allianceGuardsCount },
  ] = await mysql.query('SELECT quantity FROM alliances_resources WHERE alliance_id=? AND resource_id=?', [
    defenderAllianceID,
    'guards',
  ])
  allianceGuardsCount = Math.floor(allianceGuardsCount)
  if (allianceGuardsCount === 0) return 0

  const restockedGuards = Math.min(allianceGuardsCount, killedGuards)

  await allianceUpdateResource({
    type: 'replenish',
    resourceID: 'guards',
    resourceDiff: -restockedGuards,
    userID: defenderID,
  })

  return restockedGuards
}
