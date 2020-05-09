import { buildingsList, calcBuildingPrice, calcBuildingResistance } from './buildingsUtils'
import { PERSONNEL_OBJ } from './personnelUtils'

export const NEWBIE_ZONE_DAILY_INCOME = 750000

export function calculateIsInAttackRange(attackerDailyIncome, defenderDailyIncome) {
  if (process.env.NODE_ENV === 'development') return true
  if (attackerDailyIncome < NEWBIE_ZONE_DAILY_INCOME || defenderDailyIncome < NEWBIE_ZONE_DAILY_INCOME) return false

  const maxIncome = attackerDailyIncome * 1.2 + 2000000
  const minIncome = (attackerDailyIncome - 2000000) / 1.2
  return defenderDailyIncome >= minIncome && defenderDailyIncome <= maxIncome
}

export function calculateMaxDailyReceivedAttacks(dailyIncome) {
  if (dailyIncome < 2e6) return 3
  if (dailyIncome < 4e6) return 4
  if (dailyIncome < 8e6) return 5
  return 6 + Math.ceil((dailyIncome - 15e6) / 10e6)
}

export function calculateMissionTime(missionType) {
  if (missionType === 'attack') return process.env.NODE_ENV === 'development' ? 5 : 300
  if (missionType === 'spy') return process.env.NODE_ENV === 'development' ? 5 : 120
  return 0
}

function getBuildingDestroyedProfit({ buildingID, buildingAmount, destroyedBuildings }) {
  const currentPrice = calcBuildingPrice(buildingID, buildingAmount)
  return Math.round((currentPrice * destroyedBuildings) / 2)
}

export function calcSabotsPower(sabotageResearchLvl) {
  return 2 * PERSONNEL_OBJ.sabots.combatPower * sabotageResearchLvl
}
function calcThievesPower(sabotageResearchLvl) {
  return 2 * PERSONNEL_OBJ.thieves.combatPower * sabotageResearchLvl
}
export function calcGuardsPower(securityResearchLvl) {
  return 2 * PERSONNEL_OBJ.guards.combatPower * securityResearchLvl
}

function simulateCombat({
  attackedBuildingInfo,
  buildingAmount,
  infraResearchLvl,
  attackerSabots,
  attackerThieves,
  defensorGuards,
  defensorSecurityLvl,
  attackerSabotageLvl,
}) {
  const guardsAttackPower = calcGuardsPower(defensorSecurityLvl) / 2
  const guardsDefensePower = calcGuardsPower(defensorSecurityLvl)
  const sabotAttackPower = calcSabotsPower(attackerSabotageLvl)
  const sabotDefensePower = calcSabotsPower(attackerSabotageLvl) / 2
  const thievesAttackPower = calcThievesPower(attackerSabotageLvl)
  const thievesDefensePower = calcThievesPower(attackerSabotageLvl) / 2

  // Simulamos lucha
  let deadSabots = 0
  let deadThieves = 0
  let deadGuards = 0
  let survivingSabots = attackerSabots
  let survivingThieves = attackerThieves
  let survivingGuards = defensorGuards

  if (survivingGuards > 0) {
    // kill sabots
    const maxDeadSabots = Math.floor((survivingGuards * guardsAttackPower) / sabotDefensePower)
    deadSabots = Math.min(attackerSabots, maxDeadSabots)
    survivingSabots = attackerSabots - deadSabots

    // kill guards
    const maxDeadGuardsFromSabots = Math.floor((attackerSabots * sabotAttackPower) / guardsDefensePower)
    deadGuards = Math.min(survivingGuards, maxDeadGuardsFromSabots)
    survivingGuards = survivingGuards - deadGuards
  }
  if (survivingGuards > 0) {
    // kill thieves
    const maxDeadThieves = Math.floor((survivingGuards * guardsAttackPower) / thievesDefensePower)
    deadThieves = Math.min(attackerThieves, maxDeadThieves)
    survivingThieves = attackerThieves - deadThieves

    // kill guards
    const maxDeadGuardsFromThieves = Math.floor((attackerThieves * thievesAttackPower) / guardsDefensePower)
    deadGuards = Math.min(survivingGuards, maxDeadGuardsFromThieves)
    survivingGuards = survivingGuards - deadGuards
  }

  // Destroyed buildings
  const buildingResistance = calcBuildingResistance(attackedBuildingInfo.id, infraResearchLvl)
  const attackPowerVsBuildings = Math.max(0, survivingSabots * sabotAttackPower + survivingThieves * thievesAttackPower)
  const theoreticalDestroyedBuildings = Math.floor(attackPowerVsBuildings / buildingResistance)
  const destroyedBuildings = Math.min(
    attackedBuildingInfo.maximumDestroyedBuildings,
    buildingAmount,
    theoreticalDestroyedBuildings
  )

  // Return data
  return {
    destroyedBuildings,
    deadGuards,
    deadSabots,
    survivingSabots,
    survivingGuards,
    survivingThieves,
  }
}

export function simulateAttack({
  buildingID,
  buildingAmount,
  defensorGuards,
  attackerSabots,
  attackerThieves,
  defensorSecurityLvl,
  attackerSabotageLvl,
  infraResearchLvl,
  unprotectedMoney,
}) {
  if (typeof buildingID === 'undefined') {
    throw new Error(`Missing param ${'buildingID'} for attack simulation`)
  }
  if (typeof buildingAmount === 'undefined') {
    throw new Error(`Missing param ${'buildingAmount'} for attack simulation`)
  }
  if (typeof defensorGuards === 'undefined') {
    throw new Error(`Missing param ${'defensorGuards'} for attack simulation`)
  }
  if (typeof attackerSabots === 'undefined') {
    throw new Error(`Missing param ${'attackerSabots'} for attack simulation`)
  }
  if (typeof attackerThieves === 'undefined') {
    throw new Error(`Missing param ${'attackerThieves'} for attack simulation`)
  }
  if (typeof defensorSecurityLvl === 'undefined') {
    throw new Error(`Missing param ${'defensorSecurityLvl'} for attack simulation`)
  }
  if (typeof attackerSabotageLvl === 'undefined') {
    throw new Error(`Missing param ${'attackerSabotageLvl'} for attack simulation`)
  }
  if (typeof infraResearchLvl === 'undefined') {
    throw new Error(`Missing param ${'infraResearchLvl'} for attack simulation`)
  }
  if (typeof unprotectedMoney === 'undefined') {
    throw new Error(`Missing param ${'unprotectedMoney'} for attack simulation`)
  }
  const attackedBuildingInfo = buildingsList.find(b => b.id === buildingID)
  buildingID = parseInt(buildingID)
  buildingAmount = parseInt(buildingAmount)
  defensorGuards = parseInt(defensorGuards)
  attackerSabots = parseInt(attackerSabots)
  attackerThieves = parseInt(attackerThieves)
  defensorSecurityLvl = parseInt(defensorSecurityLvl)
  attackerSabotageLvl = parseInt(attackerSabotageLvl)
  infraResearchLvl = parseInt(infraResearchLvl)
  unprotectedMoney = parseInt(unprotectedMoney)

  const {
    deadSabots,
    deadGuards,
    survivingSabots,
    survivingGuards,
    survivingThieves,
    destroyedBuildings,
  } = simulateCombat({
    buildingAmount,
    attackedBuildingInfo,
    infraResearchLvl,
    attackerSabots,
    attackerThieves,
    defensorGuards,
    defensorSecurityLvl,
    attackerSabotageLvl,
  })

  const result = survivingGuards > 0 ? 'lose' : destroyedBuildings > 0 ? 'win' : 'draw'

  // Killed troops income
  const killedGuardsPrice = deadGuards * PERSONNEL_OBJ.guards.price
  const killedSabotsPrice = deadSabots * PERSONNEL_OBJ.sabots.price
  const incomeForKilledTroops = killedGuardsPrice * 0.1

  // Destroyed buildings income
  const incomeForDestroyedBuildings = getBuildingDestroyedProfit({
    buildingID,
    buildingAmount,
    destroyedBuildings,
  })

  // Robbing income
  const maxRobbedMoney = survivingThieves * PERSONNEL_OBJ.thieves.robbingPower
  const robbedMoney = Math.min(maxRobbedMoney, unprotectedMoney)

  // Misc calculations
  const attackerTotalIncome = incomeForKilledTroops + incomeForDestroyedBuildings + robbedMoney
  const realAttackerProfit = attackerTotalIncome - killedSabotsPrice
  const gainedFame = destroyedBuildings * attackedBuildingInfo.fame

  return {
    result,
    survivingGuards,
    survivingSabots,
    survivingThieves,
    gainedFame,
    destroyedBuildings,
    incomeForDestroyedBuildings,
    incomeForKilledTroops,
    attackerTotalIncome,
    realAttackerProfit,
    robbedMoney,
  }
}

export function calcSpiesPower(spyResearchLvl) {
  return 2 * spyResearchLvl
}
function calcSpionageDefensePower(spyResearchLvl) {
  return 5 * Math.pow(spyResearchLvl, 2.2)
}

export function calcSpyFailProbabilities({ resLvlAttacker, resLvLDefender, spiesSent }) {
  let spiesProbability = (4 * spiesSent) / resLvlAttacker
  spiesProbability = Math.min(100, Math.max(0, spiesProbability))

  let lvlProbability = 5 + (4 + Math.max(resLvLDefender, resLvlAttacker) / 4) * (resLvLDefender - resLvlAttacker)
  lvlProbability = Math.min(100, Math.max(-999, lvlProbability))

  return {
    spies: spiesProbability,
    level: lvlProbability,
    total: Math.min(100, Math.max(0, spiesProbability + lvlProbability)),
  }
}

export function calcSpyInformationPercentageRange({ resLvlAttacker, resLvLDefender, spiesRemaining }) {
  const defensePower = calcSpionageDefensePower(resLvLDefender)
  const attackPower = calcSpiesPower(resLvlAttacker) * spiesRemaining

  const randomPercentage = { min: -10, max: 10 }
  const powerPercentage = (attackPower / defensePower) * 100

  return {
    min: Math.max(0, Math.min(100, powerPercentage + randomPercentage.min)),
    max: Math.max(0, Math.min(100, powerPercentage + randomPercentage.max)),
  }
}
