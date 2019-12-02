const buildingsList = [
  {
    id: 1,
    name: 'Zapaterías',
    baseIncome: 30,
    incomeOptimizeResearchSum: 15,
    basePrice: 125,
    increasePrice: 15,
    amountForPriceIncrease: 10,
  },
  {
    id: 2,
    name: 'Bares',
    baseIncome: 60,
    incomeOptimizeResearchSum: 30,
    basePrice: 250,
    increasePrice: 30,
    amountForPriceIncrease: 9,
  },
  {
    id: 3,
    name: 'Restaurantes',
    baseIncome: 120,
    incomeOptimizeResearchSum: 60,
    basePrice: 500,
    increasePrice: 60,
    amountForPriceIncrease: 8,
  },
  {
    id: 4,
    name: 'Supermercados',
    baseIncome: 240,
    incomeOptimizeResearchSum: 120,
    basePrice: 1000,
    increasePrice: 120,
    amountForPriceIncrease: 7,
  },
  {
    id: 5,
    name: 'Droguerías',
    baseIncome: 480,
    incomeOptimizeResearchSum: 240,
    basePrice: 2000,
    increasePrice: 240,
    amountForPriceIncrease: 6,
  },
  {
    id: 6,
    name: 'Farmacias',
    baseIncome: 960,
    incomeOptimizeResearchSum: 480,
    basePrice: 4000,
    increasePrice: 480,
    amountForPriceIncrease: 5,
  },
  {
    id: 7,
    name: 'Discotecas',
    baseIncome: 1920,
    incomeOptimizeResearchSum: 960,
    basePrice: 8000,
    increasePrice: 960,
    amountForPriceIncrease: 4,
  },
  {
    id: 8,
    name: 'Cines',
    baseIncome: 3840,
    incomeOptimizeResearchSum: 1920,
    basePrice: 16000,
    increasePrice: 1920,
    amountForPriceIncrease: 3,
  },
  {
    id: 9,
    name: 'Hoteles',
    baseIncome: 7680,
    incomeOptimizeResearchSum: 3840,
    basePrice: 32000,
    increasePrice: 3840,
    amountForPriceIncrease: 2,
  },
  {
    id: 10,
    name: 'Aerolíneas',
    baseIncome: 15360,
    incomeOptimizeResearchSum: 7680,
    basePrice: 64000,
    increasePrice: 7680,
    amountForPriceIncrease: 1,
  },
]
module.exports.buildingsList = buildingsList

module.exports.calcBuildingPrice = calcBuildingPrice
function calcBuildingPrice (buildingID, currentAmount) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  return (
    buildingInfo.basePrice + buildingInfo.increasePrice * Math.floor(currentAmount / buildingInfo.amountForPriceIncrease)
  )
}

module.exports.calcBuildingDailyIncome = calcBuildingDailyIncome
function calcBuildingDailyIncome (buildingID, currentAmount, optimizeResearchLevel) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  const incomePerDay = (buildingInfo.baseIncome + buildingInfo.incomeOptimizeResearchSum * optimizeResearchLevel) * currentAmount
  return incomePerDay
}
