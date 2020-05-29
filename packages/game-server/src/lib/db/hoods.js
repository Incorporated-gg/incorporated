import mysql from '../mysql'
import { getAllianceBasicData } from './alliances'
import { calcHoodMaxGuards } from 'shared-lib/hoodUtils'

let id = 0
const hoodsList = [
  { id: ++id, tier: 4, name: `Barrio ${id}`, benefit: 'alliance_research_sabots' },
  { id: ++id, tier: 5, name: `Barrio ${id}`, benefit: 'extra_income' },
  { id: ++id, tier: 3, name: `Barrio ${id}`, benefit: 'alliance_research_sabots' },
  { id: ++id, tier: 4, name: `Barrio ${id}`, benefit: 'player_research_security' },
  { id: ++id, tier: 5, name: `Barrio ${id}`, benefit: 'player_research_espionage' },
  { id: ++id, tier: 3, name: `Barrio ${id}`, benefit: 'alliance_research_thieves' },
  { id: ++id, tier: 2, name: `Barrio ${id}`, benefit: 'alliance_research_guards' },
  { id: ++id, tier: 3, name: `Barrio ${id}`, benefit: 'alliance_research_guards' },
  { id: ++id, tier: 2, name: `Barrio ${id}`, benefit: 'alliance_research_thieves' },
  { id: ++id, tier: 2, name: `Barrio ${id}`, benefit: 'extra_income' },
  { id: ++id, tier: 1, name: `Barrio ${id}`, benefit: 'alliance_research_thieves' },
  { id: ++id, tier: 1, name: `Barrio ${id}`, benefit: 'extra_income' },
  { id: ++id, tier: 2, name: `Barrio ${id}`, benefit: 'alliance_research_sabots' },
  { id: ++id, tier: 1, name: `Barrio ${id}`, benefit: 'extra_income' },
  { id: ++id, tier: 1, name: `Barrio ${id}`, benefit: 'alliance_research_guards' },
  { id: ++id, tier: 2, name: `Barrio ${id}`, benefit: 'alliance_research_guards' },
  { id: ++id, tier: 4, name: `Barrio ${id}`, benefit: 'alliance_research_guards' },
  { id: ++id, tier: 3, name: `Barrio ${id}`, benefit: 'extra_income' },
  { id: ++id, tier: 2, name: `Barrio ${id}`, benefit: 'alliance_research_sabots' },
  { id: ++id, tier: 1, name: `Barrio ${id}`, benefit: 'alliance_research_sabots' },
  { id: ++id, tier: 5, name: `Barrio ${id}`, benefit: 'player_research_espionage' },
  { id: ++id, tier: 4, name: `Barrio ${id}`, benefit: 'player_research_defense' },
  { id: ++id, tier: 1, name: `Barrio ${id}`, benefit: 'alliance_research_guards' },
  { id: ++id, tier: 1, name: `Barrio ${id}`, benefit: 'alliance_research_sabots' },
]

async function populateHoodsDBTable() {
  const tierToInitialLevel = {
    1: 0,
    2: 5,
    3: 10,
    4: 15,
    5: 20,
  }
  hoodsList.map(async hoodInfo => {
    let doesExist = await mysql.selectOne('SELECT level FROM hoods WHERE id=?', [hoodInfo.id])

    // Create hood entry
    if (!doesExist) {
      const level = tierToInitialLevel[hoodInfo.tier]
      const initialGuards = calcHoodMaxGuards(level)
      await mysql.query('INSERT INTO hoods (id, guards, level) VALUES (?, ?, ?)', [hoodInfo.id, initialGuards, level])
    }
  })
}
populateHoodsDBTable()

const HOOD_ATTACK_PROTECTION_TIME = 60 * 60 * 24

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
  let isAttackable = ownerChangeTsDiff >= HOOD_ATTACK_PROTECTION_TIME
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
