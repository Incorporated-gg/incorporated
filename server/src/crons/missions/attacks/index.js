const mysql = require('../../../lib/mysql')
const {
  getUserAllianceID,
  getResearchBonusFromBuffs,
  getActiveWarBetweenAlliances,
} = require('../../../lib/db/alliances')
const { calcBuildingMaxMoney } = require('shared-lib/buildingsUtils')
const { simulateAttack } = require('shared-lib/missionsUtils')
const { getResearchs, getPersonnel, getBuildings, sendMessage, runUserMoneyUpdate } = require('../../../lib/db/users')
const { onNewWarAttack } = require('../../alliance_wars')

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
    'SELECT id, user_id, target_user, data, mission_type, started_at, will_finish_at, completed FROM missions WHERE completed=? AND mission_type=? AND will_finish_at<=?',
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
  const data = JSON.parse(mission.data)
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
  ] = await Promise.all([
    getResearchs(attacker.id),
    getUserAllianceID(attacker.id),
    getResearchs(defender.id),
    getPersonnel(defender.id),
    getBuildings(defender.id),
    getUserAllianceID(defender.id),
  ])
  const [attackerResearchBonusFromBuffs, defenderResearchBonusFromBuffs] = await Promise.all([
    getResearchBonusFromBuffs(attackerAllianceID),
    getResearchBonusFromBuffs(defenderAllianceID),
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
  const unprotectedMoney = Math.min(Math.max(0, storedMoney - maxMoney.maxSafe), maxMoney.maxRobbedPerAttack)

  const {
    result,
    survivingSabots,
    survivingGuards,
    survivingThiefs,
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
    attackerThiefs: data.thiefs,
    defensorSecurityLvl: defenderSecurityLevel,
    attackerSabotageLvl: attackerSabotageLevel,
    buildingID: data.building,
    infraResearchLvl: defenderInfraLevel,
    buildingAmount,
    unprotectedMoney,
  })
  const killedSabots = data.sabots - survivingSabots
  const killedThiefs = data.thiefs - survivingThiefs
  const killedGuards = defenderPersonnel.guards - survivingGuards

  // Update mission state
  const attackReport = {
    killed_guards: killedGuards,
    killed_sabots: killedSabots,
    killed_thiefs: killedThiefs,
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

  // Update troops
  const allianceRestockGuards = await calcAllianceGuardsRestock(killedGuards, defenderAllianceID)
  const killedGuardsAfterRestock = killedGuards - allianceRestockGuards
  if (killedGuardsAfterRestock > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedGuardsAfterRestock,
      defender.id,
      'guards',
    ])
  }

  if (killedSabots > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedSabots,
      attacker.id,
      'sabots',
    ])
  }
  if (killedThiefs > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedThiefs,
      attacker.id,
      'thiefs',
    ])
  }

  // Update buildings
  await mysql.query('UPDATE buildings SET quantity=quantity-?, money=money-? WHERE user_id=? AND id=?', [
    destroyedBuildings,
    robbedMoney,
    defender.id,
    data.building,
  ])

  // Give money to attacker
  await mysql.query('UPDATE users SET money=money+? WHERE id=?', [attackerTotalIncome, attacker.id])

  // Send messages
  await sendMessage({
    receiverID: attacker.id,
    senderID: null,
    type: 'attack_report',
    data: { mission_id: mission.id },
  })
  await sendMessage({
    receiverID: defender.id,
    senderID: null,
    type: 'attack_report',
    data: { mission_id: mission.id },
  })

  // Update war data if there's one
  await checkAndUpdateActiveWar(attackerAllianceID, defenderAllianceID)
}

async function checkAndUpdateActiveWar(attackerAllianceID, defenderAllianceID) {
  const activeWar = await getActiveWarBetweenAlliances(attackerAllianceID, defenderAllianceID)
  if (activeWar) onNewWarAttack(activeWar.id)
}

async function calcAllianceGuardsRestock(killedGuards, defenderAllianceID) {
  if (killedGuards === 0) return 0
  if (!defenderAllianceID) return 0

  let [
    [{ quantity: allianceGuardsCount }],
  ] = await mysql.query('SELECT quantity FROM alliances_resources WHERE alliance_id=? AND resource_id=?', [
    defenderAllianceID,
    'guards',
  ])
  allianceGuardsCount = Math.floor(allianceGuardsCount)
  if (allianceGuardsCount === 0) return 0

  const restockedGuards = Math.min(allianceGuardsCount, killedGuards)
  await mysql.query('UPDATE alliances_resources SET quantity=quantity-? WHERE alliance_id=? AND resource_id=?', [
    restockedGuards,
    defenderAllianceID,
    'guards',
  ])
  return restockedGuards
}
