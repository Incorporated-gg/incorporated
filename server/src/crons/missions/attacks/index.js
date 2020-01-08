const mysql = require('../../../lib/mysql')
const { getUserAllianceID } = require('../../../lib/db/alliances')
const { calcBuildingMaxMoney } = require('shared-lib/buildingsUtils')
const { simulateAttack } = require('shared-lib/missionsUtils')
const { getResearchs, getPersonnel, getBuildings, sendMessage, runUserMoneyUpdate } = require('../../../lib/db/users')

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
  const [defensorResearchs, attackerResearchs, defensorPersonnel, defensorBuildings] = await Promise.all([
    getResearchs(defender.id),
    getResearchs(attacker.id),
    getPersonnel(defender.id),
    getBuildings(defender.id),
  ])
  const buildingAmount = defensorBuildings[data.building].quantity
  const maxMoney = calcBuildingMaxMoney({
    buildingID: data.building,
    buildingAmount,
    bankResearchLevel: defensorResearchs[4],
  })
  const storedMoney = Math.floor(defensorBuildings[data.building].money)
  const unprotectedMoney = Math.max(0, storedMoney - maxMoney.maxRobbedPerAttack)

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
    defensorGuards: defensorPersonnel.guards,
    attackerSabots: data.sabots,
    attackerThiefs: data.thiefs,
    defensorSecurityLvl: defensorResearchs[3],
    attackerSabotageLvl: attackerResearchs[2],
    buildingID: data.building,
    infraResearchLvl: defensorResearchs[6],
    buildingAmount,
    unprotectedMoney,
  })

  // Update mission state
  await mysql.query('UPDATE missions SET completed=1, gained_fame=?, result=?, profit=? WHERE id=?', [
    gainedFame,
    result,
    realAttackerProfit,
    mission.id,
  ])

  // Update troops
  const killedGuards = defensorPersonnel.guards - survivingGuards
  const allianceRestockGuards = await calcAllianceGuardsRestock(killedGuards, defender.id)
  const killedGuardsAfterRestock = killedGuards + allianceRestockGuards
  if (killedGuardsAfterRestock > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedGuardsAfterRestock,
      defender.id,
      'guards',
    ])
  }

  const killedSabots = data.sabots - survivingSabots
  if (killedSabots > 0) {
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      killedSabots,
      attacker.id,
      'sabots',
    ])
  }
  const killedThiefs = data.thiefs - survivingThiefs
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
  const msgAttackReport = {
    attacker_id: attacker.id,
    defender_id: defender.id,
    building_id: data.building,
    result,
    guards_killed: killedGuards,
    sabots_killed: killedSabots,
    thiefs_killed: killedThiefs,
    surviving_sabots: survivingSabots,
    surviving_guards: survivingGuards,
    surviving_thiefs: survivingThiefs,
    gained_fame: gainedFame,
    destroyed_buildings: destroyedBuildings,
    income_for_buildings: incomeForDestroyedBuildings,
    income_for_troops: incomeForKilledTroops,
    robbed_money: robbedMoney,
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

async function calcAllianceGuardsRestock(killedGuards, defenderID) {
  if (killedGuards === 0) return 0
  const defenderAllianceID = await getUserAllianceID(defenderID)
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
