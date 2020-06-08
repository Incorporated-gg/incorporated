import mysql from '../mysql'
import { getAllianceBasicData } from './alliances'
import { calcHoodMaxGuards, getHoodBenefitValue, HOOD_ATTACK_PROTECTION_TIME } from 'shared-lib/hoodUtils'

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

export async function getUserResearchBonusFromHoods(allianceID) {
  const bonuses = {
    espionage: 0,
    defense: 0,
    security: 0,
  }
  if (!allianceID) return bonuses

  const allianceHoods = await getAllianceHoodsData(allianceID)
  allianceHoods.forEach(hoodData => {
    const benefitValue = getHoodBenefitValue(hoodData.benefit, hoodData.tier)
    switch (hoodData.benefit) {
      case 'player_research_security': {
        bonuses.security += benefitValue
        break
      }
      case 'player_research_defense': {
        bonuses.defense += benefitValue
        break
      }
      case 'player_research_espionage': {
        bonuses.espionage += benefitValue
        break
      }
    }
  })

  return bonuses
}

export async function getHoodBonusIncomeMultiplier(allianceID) {
  let multiplier = 1
  if (!allianceID) return multiplier

  const allianceHoods = await getAllianceHoodsData(allianceID)
  allianceHoods.forEach(hoodData => {
    const benefitValue = getHoodBenefitValue(hoodData.benefit, hoodData.tier)
    switch (hoodData.benefit) {
      case 'extra_income': {
        multiplier += benefitValue / 100
        break
      }
    }
  })

  return multiplier
}

export async function getAllianceResearchBonusFromHoods(allianceID) {
  const bonuses = {
    guards: 0,
    sabots: 0,
    thieves: 0,
  }
  if (!allianceID) return bonuses

  const allianceHoods = await getAllianceHoodsData(allianceID)
  allianceHoods.forEach(hoodData => {
    const benefitValue = getHoodBenefitValue(hoodData.benefit, hoodData.tier)
    switch (hoodData.benefit) {
      case 'alliance_research_guards': {
        bonuses.guards += benefitValue
        break
      }
      case 'alliance_research_sabots': {
        bonuses.sabots += benefitValue
        break
      }
      case 'alliance_research_thieves': {
        bonuses.thieves += benefitValue
        break
      }
    }
  })

  return bonuses
}

async function getAllianceHoodsData(allianceID) {
  const hoods = await mysql.query('SELECT id FROM hoods WHERE owner=?', [allianceID])

  return await Promise.all(hoods.map(h => getHoodData(h.id)))
}

export async function getAllHoodsData() {
  return await Promise.all(hoodsList.map(h => getHoodData(h.id)))
}
