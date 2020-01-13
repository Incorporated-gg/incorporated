const CREATE_ALLIANCE_PRICE = 500000
module.exports.CREATE_ALLIANCE_PRICE = CREATE_ALLIANCE_PRICE

const RESEARCHS_LIST = [
  { id: 1, name: 'Banco', basePrice: 500000, priceIncreasePerLevel: 500000, type: 'resource' },
  { id: 2, name: 'Cabinas de guardias', basePrice: 200000, priceIncreasePerLevel: 200000, type: 'resource' },
  { id: 3, name: 'Barracones de saboteadores', basePrice: 200000, priceIncreasePerLevel: 200000, type: 'resource' },
  { id: 4, name: 'Academias de ladrones', basePrice: 200000, priceIncreasePerLevel: 200000, type: 'resource' },
  { id: 5, name: 'Buff de ataque', basePrice: 5000000, priceIncreasePerLevel: 5000000, type: 'buff' },
  { id: 6, name: 'Buff de defensa', basePrice: 5000000, priceIncreasePerLevel: 5000000, type: 'buff' },
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
  {
    resource_id: 'thiefs',
    name: 'Ladrones',
  },
]
module.exports.RESOURCES_LIST = RESOURCES_LIST

const mapResourceIDToResearchID = {
  money: 1,
  guards: 2,
  sabots: 3,
  thiefs: 4,
}
const mapResearchIDToResourceID = {
  1: 'money',
  2: 'guards',
  3: 'sabots',
  4: 'thiefs',
}
// Resource max
const maxResourcesPerLevel = {
  money: 500000,
  guards: 2000,
  sabots: 2000,
  thiefs: 500,
}
module.exports.calcResourceMax = calcResourceMax
function calcResourceMax(resourceID, researchs) {
  const researchID = mapResourceIDToResearchID[resourceID]
  const researchLevel = researchs[researchID].level
  return maxResourcesPerLevel[resourceID] * (1 + researchLevel)
}
module.exports.calcResourceMaxByResearchID = calcResourceMaxByResearchID
function calcResourceMaxByResearchID(researchID, researchLevel) {
  const resourceID = mapResearchIDToResourceID[researchID]
  return calcResourceMax(resourceID, { [researchID]: { level: researchLevel } })
}

// Resource generation
const genResourcesPerLevel = {
  money: 100000,
  guards: 200,
  sabots: 100,
  thiefs: 50,
}
module.exports.calcResourceGeneration = calcResourceGeneration
function calcResourceGeneration(resourceID, researchs) {
  const researchID = mapResourceIDToResearchID[resourceID]
  const researchLevel = researchs[researchID].level
  return genResourcesPerLevel[resourceID] * (1 + researchLevel)
}
module.exports.calcResourceGenerationByResearchID = calcResourceGenerationByResearchID
function calcResourceGenerationByResearchID(researchID, researchLevel) {
  const resourceID = mapResearchIDToResourceID[researchID]
  return calcResourceGeneration(resourceID, { [researchID]: { level: researchLevel } })
}
