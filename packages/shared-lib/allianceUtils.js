export const CREATE_ALLIANCE_PRICE = 500000
export const MAX_ALLIANCE_MEMBERS = 8
export const WAR_DAYS_DURATION = 5

export const RESEARCHS_LIST = [
  { id: 1, name: 'Banco', pricePerLvl: 500000, type: 'resource' },
  { id: 2, name: 'Cabinas de guardias', pricePerLvl: 200000, type: 'resource' },
  { id: 3, name: 'Barracones de saboteadores', pricePerLvl: 200000, type: 'resource' },
  { id: 4, name: 'Academias de ladrones', pricePerLvl: 200000, type: 'resource' },
  { id: 5, name: 'Buff de ataque', pricePerLvl: 5000000, type: 'buff' },
  { id: 6, name: 'Buff de defensa', pricePerLvl: 5000000, type: 'buff' },
]

export const RESOURCES_LIST = [
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
    resource_id: 'thieves',
    name: 'Ladrones',
  },
]

export const PERMISSIONS_OBJECT = {
  permission_admin: 'Admin',
  permission_accept_and_kick_members: 'Aceptar y echar miembros',
  permission_extract_resources: 'Extraer recursos',
  permission_activate_buffs: 'Activar buffs',
}
export const PERMISSIONS_LIST = Object.keys(PERMISSIONS_OBJECT)

export const NAMING_REQUIREMENTS = {
  short_name: {
    regExp: /^[a-z0-9]+$/i,
    minChars: 2,
    maxChars: 5,
  },
  long_name: {
    regExp: /^[a-z0-9 ]+$/i,
    minChars: 2,
    maxChars: 20,
  },
}

export function calcResearchPrice(researchID, researchLevel) {
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
  thieves: 4,
}
const mapResearchIDToResourceID = {
  1: 'money',
  2: 'guards',
  3: 'sabots',
  4: 'thieves',
}

// Resource max
const maxResourcesPerLevel = {
  money: 500000,
  guards: 2000,
  sabots: 2000,
  thieves: 1500,
}

export function calcResourceMax(resourceID, researchs) {
  const researchID = mapResourceIDToResearchID[resourceID]
  const researchLevel = researchs[researchID].level
  return maxResourcesPerLevel[resourceID] * (1 + researchLevel)
}

export function calcResourceMaxByResearchID(researchID, researchLevel) {
  const resourceID = mapResearchIDToResourceID[researchID]
  return calcResourceMax(resourceID, { [researchID]: { level: researchLevel } })
}

// Resource generation
const genResourcesPerLevel = {
  money: 100000,
  guards: 200,
  sabots: 100,
  thieves: 100,
}

export function calcResourceGeneration(resourceID, researchs) {
  const researchID = mapResourceIDToResearchID[resourceID]
  const researchLevel = researchs[researchID].level
  return genResourcesPerLevel[resourceID] * (1 + researchLevel)
}

export function calcResourceGenerationByResearchID(researchID, researchLevel) {
  const resourceID = mapResearchIDToResourceID[researchID]
  return calcResourceGeneration(resourceID, { [researchID]: { level: researchLevel } })
}

export function getMaxHoodsAttackedPerWar(dayID) {
  if (dayID < 30) return 1
  if (dayID < 60) return 2
  return 3
}
