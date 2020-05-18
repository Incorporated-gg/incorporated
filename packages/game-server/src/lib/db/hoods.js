import mysql from '../mysql'
import { getAllianceBasicData } from './alliances'

let id = 0
const hoodsList = [
  { id: ++id, tier: 1, name: `Barrio ${id}` },
  { id: ++id, tier: 1, name: `Barrio ${id}` },
  { id: ++id, tier: 1, name: `Barrio ${id}` },
  { id: ++id, tier: 1, name: `Barrio ${id}` },
  { id: ++id, tier: 2, name: `Barrio ${id}` },
  { id: ++id, tier: 2, name: `Barrio ${id}` },
  { id: ++id, tier: 2, name: `Barrio ${id}` },
  { id: ++id, tier: 2, name: `Barrio ${id}` },
  { id: ++id, tier: 3, name: `Barrio ${id}` },
  { id: ++id, tier: 3, name: `Barrio ${id}` },
  { id: ++id, tier: 3, name: `Barrio ${id}` },
  { id: ++id, tier: 3, name: `Barrio ${id}` },
  { id: ++id, tier: 4, name: `Barrio ${id}` },
  { id: ++id, tier: 4, name: `Barrio ${id}` },
  { id: ++id, tier: 4, name: `Barrio ${id}` },
  { id: ++id, tier: 4, name: `Barrio ${id}` },
  { id: ++id, tier: 4, name: `Barrio ${id}` },
  { id: ++id, tier: 5, name: `Barrio ${id}` },
  { id: ++id, tier: 5, name: `Barrio ${id}` },
  { id: ++id, tier: 5, name: `Barrio ${id}` },
]

// Populate hoods table if empty
const tierToInitialLevel = {
  1: 0,
  2: 5,
  3: 10,
  4: 15,
  5: 20,
}
hoodsList.map(async hoodInfo => {
  let doesExist = await mysql.selectOne('SELECT level FROM hoods WHERE id=?', [hoodInfo.id])

  // Janky migration for 20200518211830-revamp-hoods. Can be removed by Jun 2020
  if (doesExist && doesExist.level === null) {
    await mysql.selectOne('DELETE FROM hoods WHERE id=?', [hoodInfo.id])
    doesExist = null
  }

  // Create hood entry
  if (!doesExist) {
    const level = tierToInitialLevel[hoodInfo.tier]
    await mysql.query('INSERT INTO hoods (id, guards, level) VALUES (?, ?, ?)', [hoodInfo.id, 3000, level])
  }
})

export async function getHoodData(hoodID) {
  hoodID = parseInt(hoodID)
  if (Number.isNaN(hoodID)) return null
  const hoodInfo = hoodsList.find(h => h.id === hoodID)
  const hoodData = await mysql.selectOne('SELECT owner, guards, level, last_owner_change_at FROM hoods WHERE id=?', [
    hoodID,
  ])

  if (!hoodData) return null

  const tsNow = Math.floor(Date.now() / 1000)
  const ownerChangeTsDiff = tsNow - hoodData.last_owner_change_at
  let isAttackable = ownerChangeTsDiff >= 60 * 60 * 24
  if (!hoodData.last_owner_change_at) isAttackable = true

  return {
    ...hoodInfo,
    guards: parseInt(hoodData.guards),
    level: hoodData.level,
    last_owner_change_at: hoodData.last_owner_change_at,
    isAttackable,
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
