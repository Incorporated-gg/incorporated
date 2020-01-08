const process = require('process')

const { buildingsList, calcBuildingPrice, calcBuildingResistance } = require('./buildingsUtils')
const { personnelList } = require('./personnelUtils')

const guardsInfo = personnelList.find(t => t.resource_id === 'guards')
const sabotsInfo = personnelList.find(t => t.resource_id === 'sabots')
const thiefsInfo = personnelList.find(t => t.resource_id === 'thiefs')

module.exports.calculateMissionTime = calculateMissionTime
function calculateMissionTime(missionType) {
  if (missionType === 'attack') return process.env.NODE_ENV === 'dev' ? 10 : 300
  if (missionType === 'spy') return process.env.NODE_ENV === 'dev' ? 10 : 120
  return 0
}

function getBuildingDestroyedProfit({ buildingID, buildingAmount, destroyedBuildings }) {
  const currentPrice = calcBuildingPrice(buildingID, buildingAmount)
  return Math.round((currentPrice * destroyedBuildings) / 2)
}

function simulateCombat({
  attackedBuildingInfo,
  buildingAmount,
  infraResearchLvl,
  attackerSabots,
  attackerThiefs,
  defensorGuards,
  defensorSecurityLvl,
  attackerSabotageLvl,
}) {
  const guardsAttackPower = guardsInfo.combatPower * defensorSecurityLvl
  const guardsDefensePower = 2 * guardsInfo.combatPower * defensorSecurityLvl
  const sabotAttackPower = 2 * sabotsInfo.combatPower * attackerSabotageLvl
  const sabotDefensePower = sabotsInfo.combatPower * attackerSabotageLvl
  const thiefsAttackPower = 2 * thiefsInfo.combatPower * attackerSabotageLvl
  const thiefsDefensePower = thiefsInfo.combatPower * attackerSabotageLvl

  // Simulamos lucha
  let deadSabots = 0
  let deadThiefs = 0
  let deadGuards = 0
  let survivingSabots = attackerSabots
  let survivingThiefs = attackerThiefs
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
    // kill thiefs
    const maxDeadThiefs = Math.floor((survivingGuards * guardsAttackPower) / thiefsDefensePower)
    deadThiefs = Math.min(attackerThiefs, maxDeadThiefs)
    survivingThiefs = attackerThiefs - deadThiefs

    // kill guards
    const maxDeadGuardsFromThiefs = Math.floor((attackerThiefs * thiefsAttackPower) / guardsDefensePower)
    deadGuards = Math.min(survivingGuards, maxDeadGuardsFromThiefs)
    survivingGuards = survivingGuards - deadGuards
  }

  // Destroyed buildings
  const buildingResistance = calcBuildingResistance(attackedBuildingInfo.id, infraResearchLvl)
  const attackPowerVsBuildings = Math.max(0, survivingSabots * sabotAttackPower + survivingThiefs * thiefsAttackPower)
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
    survivingThiefs,
  }
}

module.exports.simulateAttack = simulateAttack
function simulateAttack({
  buildingID,
  buildingAmount,
  defensorGuards,
  attackerSabots,
  attackerThiefs,
  defensorSecurityLvl,
  attackerSabotageLvl,
  infraResearchLvl,
  unprotectedMoney,
}) {
  if (
    typeof buildingID === 'undefined' ||
    typeof buildingAmount === 'undefined' ||
    typeof defensorGuards === 'undefined' ||
    typeof attackerSabots === 'undefined' ||
    typeof attackerThiefs === 'undefined' ||
    typeof defensorSecurityLvl === 'undefined' ||
    typeof attackerSabotageLvl === 'undefined' ||
    typeof infraResearchLvl === 'undefined' ||
    typeof unprotectedMoney === 'undefined'
  ) {
    throw new Error('Missing params for attack simulation')
  }
  const attackedBuildingInfo = buildingsList.find(b => b.id === buildingID)

  const {
    deadSabots,
    deadGuards,
    survivingSabots,
    survivingGuards,
    survivingThiefs,
    destroyedBuildings,
  } = simulateCombat({
    buildingAmount,
    attackedBuildingInfo,
    infraResearchLvl,
    attackerSabots,
    attackerThiefs,
    defensorGuards,
    defensorSecurityLvl,
    attackerSabotageLvl,
  })

  const result = survivingGuards > 0 ? 'lose' : destroyedBuildings > 0 ? 'win' : 'draw'

  // Killed troops income
  const killedGuardsPrice = deadGuards * guardsInfo.price
  const killedSabotsPrice = deadSabots * sabotsInfo.price
  const incomeForKilledTroops = killedGuardsPrice * 0.1 + killedSabotsPrice * 0.1

  // Destroyed buildings income
  const incomeForDestroyedBuildings = getBuildingDestroyedProfit({
    buildingID,
    buildingAmount,
    destroyedBuildings,
  })

  // Robbing income
  const maxRobbedMoney = survivingSabots * sabotsInfo.robbingPower + survivingThiefs * thiefsInfo.robbingPower
  const robbedMoney = Math.min(maxRobbedMoney, unprotectedMoney)

  // Misc calculations
  const attackerTotalIncome = incomeForKilledTroops + incomeForDestroyedBuildings + robbedMoney
  const realAttackerProfit = attackerTotalIncome - killedSabotsPrice
  const gainedFame = destroyedBuildings * attackedBuildingInfo.fame

  return {
    result,
    survivingGuards,
    survivingSabots,
    survivingThiefs,
    gainedFame,
    destroyedBuildings,
    incomeForDestroyedBuildings,
    incomeForKilledTroops,
    attackerTotalIncome,
    realAttackerProfit,
    robbedMoney,
  }
}
