import { PERSONNEL_OBJ } from './personnelUtils'

export const CREATE_ALLIANCE_PRICE = 100000
export const MAX_ALLIANCE_MEMBERS = 8
export const WAR_DAYS_DURATION = 5

export const ALLIANCE_RESEARCHS = {
  2: {
    id: 2,
    name: 'Barracones de guardias',
    resourceGeneratedName: 'Guardias',
    pricePerLvl: 200000,
    type: 'resource',
  },
  3: {
    id: 3,
    name: 'Cabinas de gángsters',
    resourceGeneratedName: 'Gángsters',
    pricePerLvl: 200000,
    type: 'resource',
  },
  4: { id: 4, name: 'Academias de ladrones', resourceGeneratedName: 'Ladrones', pricePerLvl: 200000, type: 'resource' },
  5: { id: 5, name: 'Buff de ataque', pricePerLvl: 5000000, type: 'buff' },
  6: { id: 6, name: 'Buff de defensa', pricePerLvl: 5000000, type: 'buff' },
}

export const ALLIANCE_RESOURCES_LIST = [
  {
    resource_id: 'sabots',
    name: PERSONNEL_OBJ.sabots.name,
  },
  {
    resource_id: 'guards',
    name: PERSONNEL_OBJ.guards.name,
  },
  {
    resource_id: 'thieves',
    name: PERSONNEL_OBJ.thieves.name,
  },
]

export const PERMISSIONS_OBJECT = {
  permission_admin: 'Admin',
  permission_accept_and_kick_members: 'Editar miembros',
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
    regExp: /^[a-z0-9 _-]+$/i,
    minChars: 2,
    maxChars: 20,
  },
}

export function calcResearchPrice(researchID, researchLevel) {
  const data = ALLIANCE_RESEARCHS[researchID]
  if (!data) return false

  if (data.type === 'buff') {
    // Custom price formula for buffs
    return data.pricePerLvl * Math.pow(researchLevel + 1, 2)
  }

  return data.pricePerLvl * (researchLevel + 1)
}

const mapResearchIDToResourceID = {
  2: 'guards',
  3: 'sabots',
  4: 'thieves',
}

// Resource max
const maxResourcesPerLevel = {
  guards: 2000,
  sabots: 2000,
  thieves: 2500,
}

export function calcAllianceResourceMax(researchID, researchLevel) {
  const resourceID = mapResearchIDToResourceID[researchID]
  return maxResourcesPerLevel[resourceID] * (1 + researchLevel)
}

// Resource generation
const genResourcesPerLevel = {
  money: 100000,
  guards: 200,
  sabots: 100,
  thieves: 100,
}

export function calcAllianceResourceGeneration(researchID, researchLevel) {
  const resourceID = mapResearchIDToResourceID[researchID]
  return genResourcesPerLevel[resourceID] * (1 + researchLevel)
}
