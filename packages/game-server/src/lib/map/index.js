import Alea from 'alea'
import generateHoodName from './generate-hood-name'
import mysql from '../mysql'
import { getBasicData as getAllianceBasicData } from '../db/alliances'

const DISTRICT_COUNT = 10

const districts = new Array(DISTRICT_COUNT).fill(null).map((_, index) => {
  const randomNumFn = new Alea('district' + index)
  return {
    id: index + 1,
    name: generateHoodName(randomNumFn),
    hoodCount: Math.floor(randomNumFn() * (5 + 1 - 3) + 3),
  }
})

export const hoods = []

async function prepareHoods() {
  const hoodsQuery = await mysql.query('SELECT id, owner, guards FROM hoods')

  await Promise.all(
    districts.map(district =>
      Promise.all(
        new Array(district.hoodCount).fill(null).map(async (_, hoodIndex) => {
          const randomNumFn = new Alea('district' + district.id + ':hood' + hoodIndex)
          const startingHoodID = districts
            .filter(d => d.id < district.id)
            .map(d => d.hoodCount)
            .reduce((a, b) => a + b, 0)
          const hoodID = startingHoodID + hoodIndex + 1
          const hoodLevel = Math.floor(randomNumFn() * (5 + 1 - 1) + 1)
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
    )
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
