module.exports.CREATE_ALLIANCE_PRICE = 500000
module.exports.MAX_ALLIANCE_MEMBERS = 8

const RESEARCHS_LIST = [
  { id: 1, name: 'Banco', pricePerLvl: 500000, type: 'resource' },
  { id: 2, name: 'Cabinas de guardias', pricePerLvl: 200000, type: 'resource' },
  { id: 3, name: 'Barracones de saboteadores', pricePerLvl: 200000, type: 'resource' },
  { id: 4, name: 'Academias de ladrones', pricePerLvl: 200000, type: 'resource' },
  { id: 5, name: 'Buff de ataque', pricePerLvl: 5000000, type: 'buff' },
  { id: 6, name: 'Buff de defensa', pricePerLvl: 5000000, type: 'buff' },
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

module.exports.calcResearchPrice = calcResearchPrice
function calcResearchPrice(researchID, researchLevel) {
  const data = RESEARCHS_LIST.find(raw => raw.id === researchID)
  if (!data) return false

  if (data.type === 'buff') {
    // Custom price formula for buffs
    return data.pricePerLvl * Math.pow(researchLevel + 1, 2)
  }

  return data.pricePerLvl * (researchLevel + 1)
}

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
