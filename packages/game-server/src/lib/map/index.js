import Alea from 'alea'
import generateHoodName from './generate-hood-name'
import mysql from '../mysql'
import { getAllianceBasicData } from '../db/alliances'

const districts = [
  {
    id: 1,
    name: 'La Tierna Seawalk',
    level: 1,
    hoodCount: 28,
  },
  {
    id: 2,
    name: 'Redrock Park',
    level: 1,
    hoodCount: 8,
  },
  {
    id: 3,
    name: 'El Valle',
    level: 2,
    hoodCount: 12,
  },
  {
    id: 4,
    name: 'El Soto',
    level: 2,
    hoodCount: 14,
  },
  {
    id: 5,
    name: 'Soles Industrial State',
    level: 3,
    hoodCount: 16,
  },
  {
    id: 6,
    name: 'Newland Mnt.',
    level: 2,
    hoodCount: 10,
  },
  {
    id: 7,
    name: 'Las Casitas',
    level: 5,
    hoodCount: 25,
  },
  {
    id: 8,
    name: 'Argentian Trade Center',
    level: 5,
    hoodCount: 36,
  },
  {
    id: 9,
    name: 'Belavista Park',
    level: 4,
    hoodCount: 41,
  },
  {
    id: 10,
    name: 'La Santa Pier',
    level: 3,
    hoodCount: 28,
  },
  {
    id: 11,
    name: 'Eguero Beach',
    level: 2,
    hoodCount: 16,
  },
]
const hoodLevelProbabilitiesFromDistrictLevel = {
  1: { 1: 0.7, 2: 0.3, 3: 0, 4: 0, 5: 0 },
  2: { 1: 0.3, 2: 0.6, 3: 0.1, 4: 0, 5: 0 },
  3: { 1: 0.1, 2: 0.4, 3: 0.4, 4: 0.1, 5: 0 },
  4: { 1: 0, 2: 0.1, 3: 0.4, 4: 0.3, 5: 0.2 },
  5: { 1: 0, 2: 0, 3: 0.1, 4: 0.5, 5: 0.4 },
}

function getHoodLvLFromProbabilities(districtLevel, randomNum) {
  const hoodLevelProbabilities = Object.entries(hoodLevelProbabilitiesFromDistrictLevel[districtLevel])

  let accum = 0
  for (const [lvl, prob] of hoodLevelProbabilities) {
    accum += prob
    if (randomNum < accum) return lvl
  }

  throw new Error('getHoodLvLFromProbabilities reached unreachable')
}

export const hoods = []

async function prepareHoods() {
  const hoodsQuery = await mysql.query('SELECT id, owner, guards FROM hoods')

  await Promise.all(
    districts.map(district => {
      const startingHoodID = districts
        .filter(d => d.id < district.id)
        .map(d => d.hoodCount)
        .reduce((a, b) => a + b, 0)
      const hoodIDs = new Array(district.hoodCount).fill(null).map((_, hoodIndex) => startingHoodID + hoodIndex + 1)
      return Promise.all(
        hoodIDs.map(async hoodID => {
          const randomNumFn = new Alea('district' + district.id + ',hood' + hoodID)

          const hoodLevel = getHoodLvLFromProbabilities(district.level, randomNumFn())
          const hoodInfo = getHoodInfo(hoodLevel)

          let hoodData = hoodsQuery.find(hood => hood.id === hoodID)
          if (!hoodData) {
            await mysql.query('INSERT INTO hoods (id, owner, guards) VALUES (?, ?, ?)', [
              hoodID,
              null,
              hoodInfo.maxGuards,
            ])
            hoodData = await mysql.selectOne('SELECT id, owner, guards FROM hoods WHERE id=?', [hoodID])
          }

          const owner = hoodData.owner ? await getAllianceBasicData(hoodData.owner) : null

          hoods[hoodID - 1] = {
            id: hoodID,
            level: hoodLevel,
            name: generateHoodName(randomNumFn),
            guards: parseFloat(hoodData.guards),
            district,
            owner,
            info: hoodInfo,
          }
        })
      )
    })
  )
}

function getHoodInfo(hoodLevel) {
  const maxGuardsMap = {
    1: 10000,
    2: 25000,
    3: 50000,
    4: 80000,
    5: 150000,
  }
  return {
    maxGuards: maxGuardsMap[hoodLevel],
    guardsRegenerationPerDay: maxGuardsMap[hoodLevel] * 0.2 * 24,
  }
}

prepareHoods().catch(console.error)
