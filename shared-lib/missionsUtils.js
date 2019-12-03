const { buildingsList } = require('./buildingsUtils')
const { personnelList } = require('./personnelUtils')

function getBuildingProfit(edificioID, amountBuildingsDestroyed) {
  const attackedBuilding = buildingsList.find(b => b.id === edificioID)
  let ttotal = attackedBuilding.basePrice - 2 * attackedBuilding.increasePrice

  Array.from(new Array(amountBuildingsDestroyed)).forEach((e, i) => {
    const taumento =
      attackedBuilding.increasePrice * Math.ceil(i / attackedBuilding.amountForPriceIncrease + 0.0000000000000001)
    ttotal += taumento
  })

  if (amountBuildingsDestroyed > attackedBuilding.maximumDestroyedBuildings) {
    amountBuildingsDestroyed = attackedBuilding.maximumDestroyedBuildings
  }
  ttotal = Math.round((ttotal * amountBuildingsDestroyed) / 2)
  return ttotal
}

// calculo beneficio edificio
function getProfit(edificioID, defensorNumEdificios) {
  const attackedBuilding = buildingsList.find(b => b.id === edificioID)
  let quedan = defensorNumEdificios - attackedBuilding.maximumDestroyedBuildings
  let destroyed = 0
  if (quedan < 0) {
    destroyed = defensorNumEdificios
  } else {
    destroyed = attackedBuilding.maximumDestroyedBuildings
  }
  const profit = getBuildingProfit(edificioID, destroyed)

  return profit
}

module.exports.calcularAtaque = calcularAtaque
function calcularAtaque({
  defensorGuards,
  attackerSabots,
  defensorSecurityLvl,
  attackerSabotageLvl,
  edificioID,
  defensorInfraLvl,
  defensorNumEdificios,
}) {
  if (
    typeof defensorGuards === 'undefined' ||
    typeof attackerSabots === 'undefined' ||
    typeof defensorSecurityLvl === 'undefined' ||
    typeof attackerSabotageLvl === 'undefined' ||
    typeof edificioID === 'undefined' ||
    typeof defensorInfraLvl === 'undefined' ||
    typeof defensorNumEdificios === 'undefined'
  ) {
    throw new Error('Missing params para calcular ataque')
  }
  let resultado
  // generamos datos
  const guardsAttackPower = personnelList.find(t => t.resource_id === 'guards').attackPower * defensorSecurityLvl // ataque de guardia
  const guardsDefensePower = personnelList.find(t => t.resource_id === 'guards').defensePower * defensorSecurityLvl // defensa de guardia
  const sabotAttackPower = personnelList.find(t => t.resource_id === 'sabots').attackPower * attackerSabotageLvl // ataque de saboteador
  const sabotDefensePower = personnelList.find(t => t.resource_id === 'sabots').defensePower * attackerSabotageLvl // defensa de saboteador
  const attackedBuilding = buildingsList.find(b => b.id === edificioID)

  const resistencia = attackedBuilding.baseResistance + attackedBuilding.resistanceIncrease * (defensorInfraLvl - 1) // resistencia del edificio a destruir
  const guardsPrice = personnelList.find(t => t.resource_id === 'guards').price // precio de guardia
  const sabotPrice = personnelList.find(t => t.resource_id === 'sabots').price // precio de saboteador

  // simulamos datos
  const estimatedDeadGuards = Math.floor((attackerSabots * sabotAttackPower) / guardsDefensePower) // guards muertos teoricos
  const estimatedDeadSabots = Math.floor((defensorGuards * guardsAttackPower) / sabotDefensePower) // sabots muertos teoricos

  if (estimatedDeadGuards >= defensorGuards) {
    if (estimatedDeadSabots < attackerSabots) {
      resultado = 'ganas'
    } else {
      resultado = 'empate'
    }
  } else {
    resultado = 'pierdes'
  }

  // resultado
  if (resultado === 'ganas') {
    const realDeadGuards = defensorGuards // muerte guards real
    const realDeadSabots = estimatedDeadSabots // muerte sabots real

    const survivingSabots = attackerSabots - realDeadSabots // sabots vivos
    const survivingGuards = defensorGuards - realDeadGuards // sabots vivos

    // Dinero recuperado por tropas muertas
    const recoveredIncomeForDeadGuards = realDeadGuards * guardsPrice // dinero de guards muertos
    const recoveredIncomeForDeadSabots = realDeadSabots * sabotPrice // dinero de sabots muertos
    const incomeForRecoveredTroops = recoveredIncomeForDeadGuards * 0.1 + recoveredIncomeForDeadSabots * 0.1 // dinero recuperado del ataque

    let destroyedBuildings = Math.floor(
      (sabotAttackPower * attackerSabots - guardsDefensePower * defensorGuards) / resistencia
    ) // edificios destruidos
    if (destroyedBuildings > attackedBuilding.maximumDestroyedBuildings) {
      destroyedBuildings = attackedBuilding.maximumDestroyedBuildings
    } // no superar limites edificios destruidos
    // const remainingBuildings = defensorNumEdificios - destroyedBuildings //edificios restantes

    const gainedFame = destroyedBuildings * attackedBuilding.fame // fama ganada

    const recu = getProfit(edificioID, defensorNumEdificios)

    // const buildingsLostIncome = recu * 2 // dinero perdido del edificio
    const incomeForDestroyedBuildings = recu // dinero recuperado del edificio

    // const pt = recoveredIncomeForDeadGuards + die //perdidas totales defensor
    const attackerTotalIncome = incomeForRecoveredTroops + incomeForDestroyedBuildings // recuperado total atacante
    const realAttackerProfit = attackerTotalIncome - recoveredIncomeForDeadSabots // ganancia real atacante

    const resultadoAtaque = {
      resultado,
      survivingSabots,
      survivingGuards,
      gainedFame,
      destroyedBuildings,
      incomeForDestroyedBuildings,
      incomeForRecoveredTroops,
      attackerTotalIncome,
      realAttackerProfit,
    }
    return resultadoAtaque
  }
}
