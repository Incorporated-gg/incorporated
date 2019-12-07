const { buildingsList } = require('./buildingsUtils')
const { personnelList } = require('./personnelUtils')

module.exports.calculateMissionTime = calculateMissionTime
function calculateMissionTime(missionType, personnelSent) {
  if (missionType === 'attack') return 300
  if (missionType === 'hack') return 120
  return 0
}

function getBuildingDestroyedProfit({ attackedBuildingInfo, destroyedBuildings }) {
  let ttotal = attackedBuildingInfo.basePrice - 2 * attackedBuildingInfo.increasePrice

  Array.from(new Array(destroyedBuildings)).forEach((e, i) => {
    const taumento =
      attackedBuildingInfo.increasePrice *
      Math.ceil(i / attackedBuildingInfo.amountForPriceIncrease + 0.0000000000000001)
    ttotal += taumento
  })

  if (destroyedBuildings > attackedBuildingInfo.maximumDestroyedBuildings) {
    destroyedBuildings = attackedBuildingInfo.maximumDestroyedBuildings
  }
  ttotal = Math.round((ttotal * destroyedBuildings) / 2)
  return ttotal
}

function simulateCombat({ attackerSabots, defensorGuards, defensorSecurityLvl, attackerSabotageLvl }) {
  const guardsAttackPower = personnelList.find(t => t.resource_id === 'guards').attackPower * defensorSecurityLvl // ataque de guardia
  const guardsDefensePower = personnelList.find(t => t.resource_id === 'guards').defensePower * defensorSecurityLvl // defensa de guardia
  const sabotAttackPower = personnelList.find(t => t.resource_id === 'sabots').attackPower * attackerSabotageLvl // ataque de saboteador
  const sabotDefensePower = personnelList.find(t => t.resource_id === 'sabots').defensePower * attackerSabotageLvl // defensa de saboteador

  // simulamos datos
  const maxDeadGuards = Math.floor((attackerSabots * sabotAttackPower) / guardsDefensePower)
  const maxDeadSabots = Math.floor((defensorGuards * guardsAttackPower) / sabotDefensePower)
  const deadGuards = Math.min(defensorGuards, maxDeadGuards)
  const deadSabots = Math.min(attackerSabots, maxDeadSabots)
  const survivingSabots = attackerSabots - deadSabots
  const survivingGuards = defensorGuards - deadGuards
  return {
    deadGuards,
    deadSabots,
    survivingSabots,
    survivingGuards,
    sabotAttackPower,
    guardsDefensePower,
  }
}

function calcDestroyedBuildings({
  defensorNumEdificios,
  attackedBuildingInfo,
  defensorInfraLvl,
  sabotAttackPower,
  attackerSabots,
  guardsDefensePower,
  defensorGuards,
}) {
  const buildingResistance =
    attackedBuildingInfo.baseResistance + attackedBuildingInfo.resistanceIncrease * (defensorInfraLvl - 1)
  const theoreticalDestroyedBuildings = Math.floor(
    (sabotAttackPower * attackerSabots - guardsDefensePower * defensorGuards) / buildingResistance
  )

  return Math.min(attackedBuildingInfo.maximumDestroyedBuildings, defensorNumEdificios, theoreticalDestroyedBuildings)
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

  const {
    deadSabots,
    deadGuards,
    survivingSabots,
    survivingGuards,
    sabotAttackPower,
    guardsDefensePower,
  } = simulateCombat({
    attackerSabots,
    defensorGuards,
    defensorSecurityLvl,
    attackerSabotageLvl,
  })

  const result = survivingGuards > 0 ? 'lose' : survivingSabots > 0 ? 'win' : 'draw'

  // Killed troops income
  const killedGuardsPrice = deadGuards * guardsPrice
  const killedSabotsPrice = deadSabots * sabotPrice
  const incomeForKilledTroops = killedGuardsPrice * 0.1 + killedSabotsPrice * 0.1

  // Destroyed buildings income
  const destroyedBuildings =
    result === 'win'
      ? calcDestroyedBuildings({
          defensorNumEdificios,
          attackedBuildingInfo,
          defensorInfraLvl,
          sabotAttackPower,
          attackerSabots,
          guardsDefensePower,
          defensorGuards,
        })
      : 0
  const incomeForDestroyedBuildings = getBuildingDestroyedProfit({
    attackedBuildingInfo,
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
