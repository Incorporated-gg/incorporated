export const buildingsList = [
  {
    id: 1,
    name: 'Sastrerías',
    nameGender: 'fem',
    basePrice: 1000,
    baseIncome: 1000,
    maximumDestroyedBuildings: 32,
    requiredOptimizeResearchLevel: 1,
    resistanceDivider: 32,
    fame: 1000,
  },
  {
    id: 2,
    name: 'Bares',
    nameGender: 'masc',
    basePrice: 3500,
    baseIncome: 2000,
    maximumDestroyedBuildings: 16,
    requiredOptimizeResearchLevel: 3,
    resistanceDivider: 16,
    fame: 2000,
  },
  {
    id: 3,
    name: 'Droguerías',
    nameGender: 'fem',
    basePrice: 12000,
    baseIncome: 4000,
    maximumDestroyedBuildings: 8,
    requiredOptimizeResearchLevel: 5,
    resistanceDivider: 8,
    fame: 4000,
  },
  {
    id: 4,
    name: 'Joyerías',
    nameGender: 'fem',
    basePrice: 42000,
    baseIncome: 8000,
    maximumDestroyedBuildings: 4,
    requiredOptimizeResearchLevel: 7,
    resistanceDivider: 4,
    fame: 8000,
  },
  {
    id: 5,
    name: 'Cines',
    nameGender: 'masc',
    basePrice: 150000,
    baseIncome: 16000,
    maximumDestroyedBuildings: 2,
    requiredOptimizeResearchLevel: 9,
    resistanceDivider: 2,
    fame: 16000,
  },
  {
    id: 6,
    name: 'Hoteles',
    nameGender: 'masc',
    basePrice: 525000,
    baseIncome: 32000,
    maximumDestroyedBuildings: 1,
    requiredOptimizeResearchLevel: 11,
    resistanceDivider: 1,
    fame: 32000,
  },
]

export function calcBuildingPrice(buildingID, currentAmount) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (!buildingInfo) throw new Error(`Building ${buildingID} not found`)

  const priceMultiplier = 0.5 * currentAmount * (currentAmount + 1)
  const price =
    buildingInfo.basePrice + (0.05 / buildingInfo.maximumDestroyedBuildings) * buildingInfo.basePrice * priceMultiplier

  return Math.round(price)
}

export function calcBuildingDailyIncome(buildingID, currentAmount, optimizeResearchLevel) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (!buildingInfo) throw new Error(`Building ${buildingID} not found`)

  optimizeResearchLevel = Math.max(optimizeResearchLevel, buildingInfo.requiredOptimizeResearchLevel)

  const optimizeMultiplier = 0.5 * (optimizeResearchLevel - 1) * optimizeResearchLevel
  const income = buildingInfo.baseIncome + (1600 / buildingInfo.maximumDestroyedBuildings) * optimizeMultiplier

  return Math.round(income * currentAmount)
}

export function calcBuildingResistance(buildingID, infraLevel) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (!buildingInfo) throw new Error(`Building ${buildingID} not found`)

  return Math.round((750 * infraLevel * Math.pow(Math.E, 0.08 * infraLevel)) / buildingInfo.resistanceDivider)
}

const BANK_UNSAFE_THRESHHOLD = 0.4
export function calcBuildingMaxMoney({ buildingID, buildingAmount, bankResearchLevel }) {
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  if (buildingAmount < 1) buildingAmount = 1

  const maxTotalPer =
    800 / buildingInfo.maximumDestroyedBuildings +
    (240 / buildingInfo.maximumDestroyedBuildings) * bankResearchLevel * (bankResearchLevel - 1)
  const maxSafePer = maxTotalPer * BANK_UNSAFE_THRESHHOLD

  return {
    maxSafe: maxSafePer * buildingAmount,
    maxTotal: maxTotalPer * buildingAmount,
  }
}

export function getBuildingDestroyedProfit({ buildingID, buildingAmount, destroyedBuildings }) {
  const currentPrice = calcBuildingPrice(buildingID, buildingAmount)
  return Math.round((currentPrice * destroyedBuildings) / 2)
}
