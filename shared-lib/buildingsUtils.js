const basePrice = [null, 125, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]
const increasePrice = [null, 15, 30, 60, 120, 240, 480, 960, 1920, 3840, 7680]
const amountForPriceIncrease = [null, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
const baseIncome = [null, 30, 60, 120, 240, 480, 960, 1920, 3840, 7680, 15360]
const optimizeResearchSum = [null, 15, 30, 60, 120, 240, 480, 960, 1920, 3840, 7680]

const buildingsList = [
  { id: 1, name: 'Discotecas' },
  { id: 2, name: 'Supermercados' },
  { id: 3, name: 'Bares' },
  { id: 4, name: 'Restaurantes' },
  { id: 5, name: 'Hoteles' },
  { id: 6, name: 'Droguerías' },
  { id: 7, name: 'Cines' },
  { id: 8, name: 'Farmacias' },
  { id: 9, name: 'Despachos' },
  { id: 10, name: 'Aerolíneas' },
]
module.exports.buildingsList = buildingsList

function calcBuildingPrice (buildingID, currentAmount) {
  return (
    basePrice[buildingID] + increasePrice[buildingID] * Math.floor(currentAmount / amountForPriceIncrease[buildingID])
  )
}
module.exports.calcBuildingPrice = calcBuildingPrice

function calcBuildingIncomePerDay (buildingID, currentAmount, optimizeResearchLevel) {
  const incomePerDay = baseIncome[buildingID] * currentAmount + optimizeResearchSum[buildingID] * optimizeResearchLevel
  return incomePerDay
}

function calcBuildingIncomePerSecond (buildingID, currentAmount, optimizeResearchLevel) {
  return calcBuildingIncomePerDay(buildingID, currentAmount, optimizeResearchLevel) / 60 / 60 / 24
}

module.exports.calcBuildingIncomePerSecond = calcBuildingIncomePerSecond
module.exports.calcBuildingIncomePerDay = calcBuildingIncomePerDay
