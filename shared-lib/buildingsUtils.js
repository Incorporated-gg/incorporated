const buildingsList = [
  {
    id: 1,
    name: 'Zapaterías',
    baseIncome: 30,
    incomeOptimizeResearchSum: 15,
    basePrice: 125,
    increasePrice: 15,
    amountForPriceIncrease: 10,
    maximumDestroyedBuildings: 10,
    fame: 1,
  },
  {
    id: 2,
    name: 'Bares',
    baseIncome: 60,
    incomeOptimizeResearchSum: 30,
    basePrice: 250,
    increasePrice: 30,
    amountForPriceIncrease: 9,
    maximumDestroyedBuildings: 9,
    fame: 2,
  },
  {
    id: 3,
    name: 'Restaurantes',
    baseIncome: 120,
    incomeOptimizeResearchSum: 60,
    basePrice: 500,
    increasePrice: 60,
    amountForPriceIncrease: 8,
    maximumDestroyedBuildings: 8,
    fame: 4,
  },
  {
    id: 4,
    name: 'Supermercados',
    baseIncome: 240,
    incomeOptimizeResearchSum: 120,
    basePrice: 1000,
    increasePrice: 120,
    amountForPriceIncrease: 7,
    maximumDestroyedBuildings: 7,
    fame: 8,
  },
  {
    id: 5,
    name: 'Droguerías',
    baseIncome: 480,
    incomeOptimizeResearchSum: 240,
    basePrice: 2000,
    increasePrice: 240,
    amountForPriceIncrease: 6,
    maximumDestroyedBuildings: 6,
    fame: 16,
  },
  {
    id: 6,
    name: 'Farmacias',
    baseIncome: 960,
    incomeOptimizeResearchSum: 480,
    basePrice: 4000,
    increasePrice: 480,
    amountForPriceIncrease: 5,
    maximumDestroyedBuildings: 5,
    fame: 32,
  },
  {
    id: 7,
    name: 'Discotecas',
    baseIncome: 1920,
    incomeOptimizeResearchSum: 960,
    basePrice: 8000,
    increasePrice: 960,
    amountForPriceIncrease: 4,
    maximumDestroyedBuildings: 4,
    fame: 64,
  },
  {
    id: 8,
    name: 'Cines',
    baseIncome: 3840,
    incomeOptimizeResearchSum: 1920,
    basePrice: 16000,
    increasePrice: 1920,
    amountForPriceIncrease: 3,
    maximumDestroyedBuildings: 3,
    fame: 128,
  },
  {
    id: 9,
    name: 'Hoteles',
    baseIncome: 7680,
    incomeOptimizeResearchSum: 3840,
    basePrice: 32000,
    increasePrice: 3840,
    amountForPriceIncrease: 2,
    maximumDestroyedBuildings: 2,
    fame: 256,
  },
  {
    id: 10,
    name: 'Aerolíneas',
    baseIncome: 15360,
    incomeOptimizeResearchSum: 7680,
    basePrice: 64000,
    increasePrice: 7680,
    amountForPriceIncrease: 1,
    maximumDestroyedBuildings: 1,
    fame: 512,
  },
]
module.exports.buildingsList = buildingsList

module.exports.calcBuildingPrice = calcBuildingPrice
function calcBuildingPrice(buildingID, currentAmount) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (!buildingInfo) throw new Error(`Building ${buildingID} not found`)
  let ttotal = buildingInfo.basePrice - 2 * buildingInfo.increasePrice

  for (let i = 0; i <= currentAmount + 1; i++) {
    ttotal += buildingInfo.increasePrice * Math.ceil(i / buildingInfo.amountForPriceIncrease + 0.0000000000000001)
  }

  return ttotal
}

module.exports.calcBuildingDailyIncome = calcBuildingDailyIncome
function calcBuildingDailyIncome(buildingID, currentAmount, optimizeResearchLevel) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  const incomePerDay =
    (buildingInfo.baseIncome + buildingInfo.incomeOptimizeResearchSum * optimizeResearchLevel) * currentAmount
  return incomePerDay
}

module.exports.calcBuildingResistance = calcBuildingResistance
function calcBuildingResistance(buildingID, infraLevel) {
  const lvlMap = {
    1: 10,
    2: 9,
    3: 8,
    4: 7,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
    9: 2,
    10: 1,
  }
  return Math.round((750 * infraLevel * Math.pow(Math.E, 0.08 * infraLevel)) / lvlMap[buildingID])
}
