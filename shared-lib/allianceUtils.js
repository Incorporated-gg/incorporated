const CREATE_ALLIANCE_PRICE = 5000
module.exports.CREATE_ALLIANCE_PRICE = CREATE_ALLIANCE_PRICE

const RESEARCHS_LIST = [
  { id: 1, name: 'Negocios cuestionables', basePrice: 200000, priceIncreasePerLevel: 200000 },
  { id: 2, name: 'Banco', basePrice: 500000, priceIncreasePerLevel: 500000 },
  { id: 3, name: 'Academia de guardias', basePrice: 100000, priceIncreasePerLevel: 100000 },
  { id: 4, name: 'Barracones de guardias', basePrice: 200000, priceIncreasePerLevel: 200000 },
  { id: 5, name: 'Academia de saboteadores', basePrice: 100000, priceIncreasePerLevel: 100000 },
  { id: 6, name: 'Barracones de saboteadores', basePrice: 200000, priceIncreasePerLevel: 200000 },
]
module.exports.RESEARCHS_LIST = RESEARCHS_LIST

const RESOURCES_LIST = [
  {
    resource_id: 'money',
    name: 'Dinero',
  },
  {
    resource_id: 'sabots',
    name: 'Saboteadores',
  },
  {
    resource_id: 'guards',
    name: 'Guardias',
  },
]
module.exports.RESOURCES_LIST = RESOURCES_LIST

const maxResourcesPerLevel = {
  money: 500000,
  guards: 2000,
  sabots: 2000,
}
module.exports.calcResourceMax = calcResourceMax
function calcResourceMax(resourceID, researchs) {
  const researchID = resourceID === 'money' ? 2 : resourceID === 'guards' ? 4 : resourceID === 'sabots' ? 6 : null
  const researchLevel = researchs[researchID].level
  return maxResourcesPerLevel[resourceID] * (1 + researchLevel)
}

module.exports.calcResourceMaxByResearchID = calcResourceMaxByResearchID
function calcResourceMaxByResearchID(researchID, researchLevel) {
  const resourceID = researchID === 2 ? 'money' : researchID === 4 ? 'guards' : researchID === 6 ? 'sabots' : null
  return maxResourcesPerLevel[resourceID] * (1 + researchLevel)
}

const genResourcesPerLevel = {
  money: 100000,
  guards: 100,
  sabots: 50,
}
module.exports.calcResourceGeneration = calcResourceGeneration
function calcResourceGeneration(resourceID, researchs) {
  const researchID = resourceID === 'money' ? 1 : resourceID === 'guards' ? 3 : resourceID === 'sabots' ? 5 : null
  const researchLevel = researchs[researchID].level
  return genResourcesPerLevel[resourceID] * (1 + researchLevel)
}
module.exports.calcResourceGenerationByResearchID = calcResourceGenerationByResearchID
function calcResourceGenerationByResearchID(researchID, researchLevel) {
  const resourceID = researchID === 1 ? 'money' : researchID === 3 ? 'guards' : researchID === 5 ? 'sabots' : null
  return genResourcesPerLevel[resourceID] * (1 + researchLevel)
}
