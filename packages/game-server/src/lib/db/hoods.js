import mysql from '../mysql'
import { getAllianceBasicData } from './alliances'

const districts = [
  {
    id: 1,
    name: 'La Tierna Seawalk',
  },
  {
    id: 2,
    name: 'Redrock Park',
  },
  {
    id: 3,
    name: 'El Valle',
  },
  {
    id: 4,
    name: 'El Soto',
  },
  {
    id: 5,
    name: 'Soles Industrial State',
  },
  {
    id: 6,
    name: 'Newland Mnt.',
  },
  {
    id: 7,
    name: 'Las Casitas',
  },
  {
    id: 8,
    name: 'Argentian Trade Center',
  },
  {
    id: 9,
    name: 'Belavista Park',
  },
  {
    id: 10,
    name: 'La Santa Pier',
  },
  {
    id: 11,
    name: 'Eguero Beach',
  },
]

let id = 0
const hoodsList = [
  // DISTRICT 1
  // 6
  { id: ++id, districtID: 1, direction: 'Este', level: 2 },
  { id: ++id, districtID: 1, direction: 'Este', level: 2 },
  { id: ++id, districtID: 1, direction: 'Este', level: 2 },
  { id: ++id, districtID: 1, direction: 'Este', level: 2 },
  { id: ++id, districtID: 1, direction: 'Este', level: 2 },
  { id: ++id, districtID: 1, direction: 'Este', level: 2 },
  // 17
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  { id: ++id, districtID: 1, direction: 'Este', level: 3 },
  // 5
  { id: ++id, districtID: 1, direction: 'Este', level: 4 },
  { id: ++id, districtID: 1, direction: 'Este', level: 4 },
  { id: ++id, districtID: 1, direction: 'Este', level: 4 },
  { id: ++id, districtID: 1, direction: 'Este', level: 4 },
  { id: ++id, districtID: 1, direction: 'Este', level: 4 },
  // DISTRICT 2
  // 2
  { id: ++id, districtID: 2, direction: 'Este', level: 1 },
  { id: ++id, districtID: 2, direction: 'Este', level: 1 },
  // 5
  { id: ++id, districtID: 2, direction: 'Este', level: 2 },
  { id: ++id, districtID: 2, direction: 'Este', level: 2 },
  { id: ++id, districtID: 2, direction: 'Este', level: 2 },
  { id: ++id, districtID: 2, direction: 'Este', level: 2 },
  { id: ++id, districtID: 2, direction: 'Este', level: 2 },
  // 1
  { id: ++id, districtID: 2, direction: 'Este', level: 3 },
  // DISTRICT 3
  // 2
  { id: ++id, districtID: 3, direction: 'Este', level: 3 },
  { id: ++id, districtID: 3, direction: 'Este', level: 3 },
  // 7
  { id: ++id, districtID: 3, direction: 'Este', level: 4 },
  { id: ++id, districtID: 3, direction: 'Este', level: 4 },
  { id: ++id, districtID: 3, direction: 'Este', level: 4 },
  { id: ++id, districtID: 3, direction: 'Este', level: 4 },
  { id: ++id, districtID: 3, direction: 'Este', level: 4 },
  { id: ++id, districtID: 3, direction: 'Este', level: 4 },
  { id: ++id, districtID: 3, direction: 'Este', level: 4 },
  // 3
  { id: ++id, districtID: 3, direction: 'Este', level: 5 },
  { id: ++id, districtID: 3, direction: 'Este', level: 5 },
  { id: ++id, districtID: 3, direction: 'Este', level: 5 },
  // DISTRICT 4
  // 4
  { id: ++id, districtID: 4, direction: 'Este', level: 3 },
  { id: ++id, districtID: 4, direction: 'Este', level: 3 },
  { id: ++id, districtID: 4, direction: 'Este', level: 3 },
  { id: ++id, districtID: 4, direction: 'Este', level: 3 },
  // 11
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  { id: ++id, districtID: 4, direction: 'Este', level: 4 },
  // 4
  { id: ++id, districtID: 4, direction: 'Este', level: 5 },
  { id: ++id, districtID: 4, direction: 'Este', level: 5 },
  { id: ++id, districtID: 4, direction: 'Este', level: 5 },
  { id: ++id, districtID: 4, direction: 'Este', level: 5 },
  // DISTRICT 5: Soles
  // 3
  { id: ++id, districtID: 5, direction: 'Este', level: 2 },
  { id: ++id, districtID: 5, direction: 'Este', level: 2 },
  { id: ++id, districtID: 5, direction: 'Este', level: 2 },
  // 10
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  { id: ++id, districtID: 5, direction: 'Este', level: 3 },
  // 3
  { id: ++id, districtID: 5, direction: 'Este', level: 4 },
  { id: ++id, districtID: 5, direction: 'Este', level: 4 },
  { id: ++id, districtID: 5, direction: 'Este', level: 4 },
  // DISTRICT 6: Newland
  // 2
  { id: ++id, districtID: 6, direction: 'Este', level: 2 },
  { id: ++id, districtID: 6, direction: 'Este', level: 2 },
  // 6
  { id: ++id, districtID: 6, direction: 'Este', level: 3 },
  { id: ++id, districtID: 6, direction: 'Este', level: 3 },
  { id: ++id, districtID: 6, direction: 'Este', level: 3 },
  { id: ++id, districtID: 6, direction: 'Este', level: 3 },
  { id: ++id, districtID: 6, direction: 'Este', level: 3 },
  { id: ++id, districtID: 6, direction: 'Este', level: 3 },
  // 2
  { id: ++id, districtID: 6, direction: 'Este', level: 4 },
  { id: ++id, districtID: 6, direction: 'Este', level: 4 },
  // DISTRICT 7: Casitas
  // 5
  { id: ++id, districtID: 7, direction: 'Este', level: 3 },
  { id: ++id, districtID: 7, direction: 'Este', level: 3 },
  { id: ++id, districtID: 7, direction: 'Este', level: 3 },
  { id: ++id, districtID: 7, direction: 'Este', level: 3 },
  { id: ++id, districtID: 7, direction: 'Este', level: 3 },
  // 5
  { id: ++id, districtID: 7, direction: 'Este', level: 4 },
  { id: ++id, districtID: 7, direction: 'Este', level: 4 },
  { id: ++id, districtID: 7, direction: 'Este', level: 4 },
  { id: ++id, districtID: 7, direction: 'Este', level: 4 },
  { id: ++id, districtID: 7, direction: 'Este', level: 4 },
  // 15
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  { id: ++id, districtID: 7, direction: 'Este', level: 5 },
  // DISTRICT 8: Trade center
  // 7
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  { id: ++id, districtID: 8, direction: 'Este', level: 2 },
  // 21
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  { id: ++id, districtID: 8, direction: 'Este', level: 3 },
  // 8
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  { id: ++id, districtID: 8, direction: 'Este', level: 4 },
  // DISTRICT 9: Belavista
  // 8
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  { id: ++id, districtID: 9, direction: 'Este', level: 1 },
  // 8
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  { id: ++id, districtID: 9, direction: 'Este', level: 2 },
  // 25
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  { id: ++id, districtID: 9, direction: 'Este', level: 3 },
  // DISTRICT 10: La santa pier
  // 7
  { id: ++id, districtID: 10, direction: 'Este', level: 1 },
  { id: ++id, districtID: 10, direction: 'Este', level: 1 },
  { id: ++id, districtID: 10, direction: 'Este', level: 1 },
  { id: ++id, districtID: 10, direction: 'Este', level: 1 },
  { id: ++id, districtID: 10, direction: 'Este', level: 1 },
  { id: ++id, districtID: 10, direction: 'Este', level: 1 },
  { id: ++id, districtID: 10, direction: 'Este', level: 1 },
  // 15
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  { id: ++id, districtID: 10, direction: 'Este', level: 2 },
  // 6
  { id: ++id, districtID: 10, direction: 'Este', level: 3 },
  { id: ++id, districtID: 10, direction: 'Este', level: 3 },
  { id: ++id, districtID: 10, direction: 'Este', level: 3 },
  { id: ++id, districtID: 10, direction: 'Este', level: 3 },
  { id: ++id, districtID: 10, direction: 'Este', level: 3 },
  { id: ++id, districtID: 10, direction: 'Este', level: 3 },
  // DISTRICT 11: Eguero
  // 10
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  { id: ++id, districtID: 11, direction: 'Este', level: 1 },
  // 3
  { id: ++id, districtID: 11, direction: 'Este', level: 2 },
  { id: ++id, districtID: 11, direction: 'Este', level: 2 },
  { id: ++id, districtID: 11, direction: 'Este', level: 2 },
  // 3
  { id: ++id, districtID: 11, direction: 'Este', level: 3 },
  { id: ++id, districtID: 11, direction: 'Este', level: 3 },
  { id: ++id, districtID: 11, direction: 'Este', level: 3 },
]

// Calculate extra data for hoodsList
let namesAccum = {}
hoodsList.forEach((hoodInfo, index) => {
  const maxGuardsMap = {
    1: 10000,
    2: 25000,
    3: 50000,
    4: 80000,
    5: 150000,
  }
  const maxGuards = maxGuardsMap[hoodInfo.level]
  const guardsRegenerationPerDay = maxGuardsMap[hoodInfo.level] * 0.2 * 24
  const district = districts.find(d => d.id === hoodInfo.districtID)

  const namesAccumKey = district.name + hoodInfo.direction
  if (!namesAccum[namesAccumKey]) namesAccum[namesAccumKey] = 1
  else namesAccum[namesAccumKey]++

  hoodsList[index] = {
    ...hoodInfo,
    maxGuards,
    guardsRegenerationPerDay,
    district,
    districtID: undefined,
    name: `${district.name} ${hoodInfo.direction} ${namesAccum[namesAccumKey]}`,
  }
})

// Populate hoods table if empty
hoodsList.map(async hoodInfo => {
  const doesExist = await mysql.selectOne('SELECT 1 FROM hoods WHERE id=?', [hoodInfo.id])
  if (!doesExist) {
    await mysql.query('INSERT INTO hoods (id, owner, guards) VALUES (?, ?, ?)', [hoodInfo.id, null, hoodInfo.maxGuards])
  }
})

export async function getHoodData(hoodID) {
  hoodID = parseInt(hoodID)
  if (Number.isNaN(hoodID)) return null
  const hoodInfo = hoodsList.find(h => h.id === hoodID)
  const hoodData = await mysql.selectOne('SELECT owner, guards FROM hoods WHERE id=?', [hoodID])

  return {
    ...hoodInfo,
    guards: parseInt(hoodData.guards),
    owner: await getAllianceBasicData(hoodData.owner),
  }
}

export async function getAllianceHoods(allianceID) {
  const hoods = await mysql.query('SELECT id FROM hoods WHERE owner=?', [allianceID])

  return await Promise.all(hoods.map(h => getHoodData(h.id)))
}

export async function getAllHoodsData() {
  return await Promise.all(hoodsList.map(h => getHoodData(h.id)))
}

export async function changeHoodsOwner(hoodIDs, newOwnerID) {
  await mysql.query('UPDATE hoods SET owner=? WHERE id IN (?)', [newOwnerID, hoodIDs])
}

export async function changeHoodGuards(hoodID, guardsChange) {
  if (guardsChange === 0) return
  await mysql.query('UPDATE hoods SET guards=guards+? WHERE id=?', [guardsChange, hoodID])
}
