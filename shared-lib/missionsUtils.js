const process = require('process')

const { buildingsList, calcBuildingPrice } = require('./buildingsUtils')
const { personnelList } = require('./personnelUtils')

module.exports.calculateMissionTime = calculateMissionTime
function calculateMissionTime(missionType, personnelSent) {
  if (missionType === 'attack') return process.env.NODE_ENV === 'dev' ? 10 : 300
  if (missionType === 'spy') return process.env.NODE_ENV === 'dev' ? 10 : 120
  return 0
}

function getBuildingDestroyedProfit({ buildingID, defensorNumEdificios, destroyedBuildings }) {
  const currentPrice = calcBuildingPrice(buildingID, defensorNumEdificios)
  return Math.round((currentPrice * destroyedBuildings) / 2)
}

function simulateCombat({
  defensorNumEdificios,
  attackedBuildingInfo,
  defensorInfraLvl,
  attackerSabots,
  defensorGuards,
  defensorSecurityLvl,
  attackerSabotageLvl,
}) {
  const guardsAttackPower = personnelList.find(t => t.resource_id === 'guards').attackPower * defensorSecurityLvl
  const guardsDefensePower = personnelList.find(t => t.resource_id === 'guards').defensePower * defensorSecurityLvl
  const sabotAttackPower = personnelList.find(t => t.resource_id === 'sabots').attackPower * attackerSabotageLvl
  const sabotDefensePower = personnelList.find(t => t.resource_id === 'sabots').defensePower * attackerSabotageLvl

  // simulamos datos
  const maxDeadGuards = Math.floor((attackerSabots * sabotAttackPower) / guardsDefensePower)
  const maxDeadSabots = Math.floor((defensorGuards * guardsAttackPower) / sabotDefensePower)
  const deadGuards = Math.min(defensorGuards, maxDeadGuards)
  const deadSabots = Math.min(attackerSabots, maxDeadSabots)
  const survivingSabots = attackerSabots - deadSabots
  const survivingGuards = defensorGuards - deadGuards

  // Destroyed buildings
  const buildingResistance =
    attackedBuildingInfo.baseResistance + attackedBuildingInfo.resistanceIncrease * (defensorInfraLvl - 1)
  const buildingAttackingPower = Math.max(0, sabotAttackPower * survivingSabots - guardsDefensePower * survivingGuards)
  const theoreticalDestroyedBuildings = Math.floor(buildingAttackingPower / buildingResistance)
  const destroyedBuildings = Math.min(
    attackedBuildingInfo.maximumDestroyedBuildings,
    defensorNumEdificios,
    theoreticalDestroyedBuildings
  )

  // Return data
  return {
    destroyedBuildings,
    deadGuards,
    deadSabots,
    survivingSabots,
    survivingGuards,
  }
}

const guardsPrice = personnelList.find(t => t.resource_id === 'guards').price
const sabotPrice = personnelList.find(t => t.resource_id === 'sabots').price

module.exports.simulateAttack = simulateAttack
function simulateAttack({
  defensorGuards,
  attackerSabots,
  defensorSecurityLvl,
  attackerSabotageLvl,
  buildingID,
  defensorInfraLvl,
  defensorNumEdificios,
}) {
  if (
    typeof defensorGuards === 'undefined' ||
    typeof attackerSabots === 'undefined' ||
    typeof defensorSecurityLvl === 'undefined' ||
    typeof attackerSabotageLvl === 'undefined' ||
    typeof buildingID === 'undefined' ||
    typeof defensorInfraLvl === 'undefined' ||
    typeof defensorNumEdificios === 'undefined'
  ) {
    throw new Error('Missing params for attack simulation')
  }
  const attackedBuildingInfo = buildingsList.find(b => b.id === buildingID)

  const { deadSabots, deadGuards, survivingSabots, survivingGuards, destroyedBuildings } = simulateCombat({
    defensorNumEdificios,
    attackedBuildingInfo,
    defensorInfraLvl,
    attackerSabots,
    defensorGuards,
    defensorSecurityLvl,
    attackerSabotageLvl,
  })

  const result = survivingGuards > 0 ? 'lose' : destroyedBuildings > 0 ? 'win' : 'draw'

  // Killed troops income
  const killedGuardsPrice = deadGuards * guardsPrice
  const killedSabotsPrice = deadSabots * sabotPrice
  const incomeForKilledTroops = killedGuardsPrice * 0.1 + killedSabotsPrice * 0.1

  // Destroyed buildings income
  const incomeForDestroyedBuildings = getBuildingDestroyedProfit({
    buildingID,
    defensorNumEdificios,
    destroyedBuildings,
  })

  // Misc calculations
  const attackerTotalIncome = incomeForKilledTroops + incomeForDestroyedBuildings
  const realAttackerProfit = attackerTotalIncome - killedSabotsPrice
  const gainedFame = destroyedBuildings * attackedBuildingInfo.fame

  return {
    result,
    survivingSabots,
    survivingGuards,
    gainedFame,
    destroyedBuildings,
    incomeForDestroyedBuildings,
    incomeForKilledTroops,
    attackerTotalIncome,
    realAttackerProfit,
  }
}
