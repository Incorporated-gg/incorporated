export function parseBadgeJSONFromDB(badgeJson) {
  let allianceBadge = badgeJson ? JSON.parse(badgeJson) : defaultBadge

  // We can add migrations in this function when needed
  if (allianceBadge._v !== defaultBadge._v) allianceBadge = defaultBadge

  return allianceBadge
}
export function parseBadgeFromUserRequest(badgeObject) {
  if (typeof badgeObject !== 'object') throw new Error('Invalid badge object type')
  if (badgeObject._v !== defaultBadge._v) throw new Error('Invalid badge version')

  if (!objectsHaveSameKeys(defaultBadge, badgeObject)) throw new Error('Invalid badge general schema')
  if (!objectsHaveSameKeys(defaultBadge.background, badgeObject.background))
    throw new Error('Invalid badge background schema')
  if (!objectsHaveSameKeys(defaultBadge.icon, badgeObject.icon)) throw new Error('Invalid badge icon schema')

  const allianceBadge = {
    _v: badgeObject._v,
    background: {
      id: badgeObject.background.id,
      color1: badgeObject.background.color1,
      color2: badgeObject.background.color2,
    },
    icon: {
      id: badgeObject.icon.id,
      color: badgeObject.icon.color,
    },
  }
  return allianceBadge
}

const defaultBadge = {
  _v: 1,
  background: {
    id: 1,
    color1: '#FFFFFF',
    color2: '#0089FF',
  },
  icon: {
    id: 1,
    color: '#0089FF',
  },
}

function objectsHaveSameKeys(...objects) {
  const allKeys = objects.reduce((keys, object) => keys.concat(Object.keys(object)), [])
  const union = new Set(allKeys)
  return objects.every(object => union.size === Object.keys(object).length)
}
