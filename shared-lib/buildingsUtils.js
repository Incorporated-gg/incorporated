const buildingsList = [
  {
    id: 1,
    name: 'Zapaterías',
    basePrice: 1000,
    baseIncome: 2500,
    maximumDestroyedBuildings: 32,
    requiredOptimizeResearchLevel: 1,
    resistanceDivider: 32,
    fame: 1000,
  },
  {
    id: 2,
    name: 'Restaurantes',
    basePrice: 3500,
    baseIncome: 5000,
    maximumDestroyedBuildings: 16,
    requiredOptimizeResearchLevel: 3,
    resistanceDivider: 16,
    fame: 2000,
  },
  {
    id: 3,
    name: 'Droguerías',
    basePrice: 12000,
    baseIncome: 10000,
    maximumDestroyedBuildings: 8,
    requiredOptimizeResearchLevel: 5,
    resistanceDivider: 8,
    fame: 4000,
  },
  {
    id: 4,
    name: 'Bares',
    basePrice: 42000,
    baseIncome: 20000,
    maximumDestroyedBuildings: 4,
    requiredOptimizeResearchLevel: 7,
    resistanceDivider: 4,
    fame: 8000,
  },
  {
    id: 5,
    name: 'Cines',
    basePrice: 150000,
    baseIncome: 40000,
    maximumDestroyedBuildings: 2,
    requiredOptimizeResearchLevel: 9,
    resistanceDivider: 2,
    fame: 16000,
  },
  {
    id: 6,
    name: 'Hoteles',
    basePrice: 525000,
    baseIncome: 80000,
    maximumDestroyedBuildings: 1,
    requiredOptimizeResearchLevel: 11,
    resistanceDivider: 1,
    fame: 32000,
  },
]
module.exports.buildingsList = buildingsList

module.exports.calcBuildingPrice = calcBuildingPrice
function calcBuildingPrice(buildingID, currentAmount) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (!buildingInfo) throw new Error(`Building ${buildingID} not found`)

  const priceMultiplier = 0.5 * currentAmount * (currentAmount + 1)
  const price =
    buildingInfo.basePrice + (0.05 / buildingInfo.maximumDestroyedBuildings) * buildingInfo.basePrice * priceMultiplier

  return Math.round(price)
}

module.exports.calcBuildingDailyIncome = calcBuildingDailyIncome
function calcBuildingDailyIncome(buildingID, currentAmount, optimizeResearchLevel) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (!buildingInfo) throw new Error(`Building ${buildingID} not found`)

  optimizeResearchLevel = Math.max(optimizeResearchLevel, buildingInfo.requiredOptimizeResearchLevel)

  const optimizeMultiplier = 0.5 * (optimizeResearchLevel - 1) * optimizeResearchLevel
  const income = buildingInfo.baseIncome + (1280 / buildingInfo.maximumDestroyedBuildings) * optimizeMultiplier

  return Math.round(income * currentAmount)
}

module.exports.calcBuildingResistance = calcBuildingResistance
function calcBuildingResistance(buildingID, infraLevel) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (!buildingInfo) throw new Error(`Building ${buildingID} not found`)

  return Math.round((750 * infraLevel * Math.pow(Math.E, 0.08 * infraLevel)) / buildingInfo.resistanceDivider)
}

function calcBuildingMaxMoney({ buildingID, buildingAmount, bankResearchLevel }) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (buildingAmount < 1) buildingAmount = 1

  const maxTotalPer =
    800 / buildingInfo.maximumDestroyedBuildings +
    (240 / buildingInfo.maximumDestroyedBuildings) * bankResearchLevel * (bankResearchLevel - 1)
  const maxSafePer = maxTotalPer * 0.4

  return {
    maxSafe: maxSafePer * buildingAmount,
    maxTotal: maxTotalPer * buildingAmount,
    maxRobbedPerAttack: maxSafePer * buildingAmount * 0.1,
  }
}
module.exports.calcBuildingMaxMoney = calcBuildingMaxMoney
