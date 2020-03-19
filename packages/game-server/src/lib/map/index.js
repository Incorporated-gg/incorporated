import Alea from 'alea'
import generateHoodName from './generate-hood-name'
import mysql from '../mysql'
import { getBasicData as getAllianceBasicData } from '../db/alliances'

const HOODS_PER_DISTRICT = 8
const HOODS_COUNT = 60

const districts = new Array(Math.ceil(HOODS_COUNT / HOODS_PER_DISTRICT)).fill(null).map((_, index) => {
  const randomNumFn = new Alea('district' + index)
  return {
    id: index + 1,
    name: generateHoodName(randomNumFn),
  }
})

export const hoods = []

async function prepareHoods() {
  const hoodsQuery = await mysql.query('SELECT id, owner, guards FROM hoods')

  new Array(HOODS_COUNT).fill(null).forEach(async (_, index) => {
    const randomNumFn = new Alea('hood' + index)
    const hoodID = index + 1
    const district = districts[Math.floor(index / HOODS_PER_DISTRICT)]
    const hoodLevel = Math.floor(randomNumFn() * 4 + 1)
    const hoodInfo = getHoodInfo(hoodLevel)

    let hoodData = hoodsQuery.find(hood => hood.id === hoodID)
    if (!hoodData) {
      await mysql.query('INSERT INTO hoods (id, owner, guards) VALUES (?, ?, ?)', [hoodID, null, hoodInfo.maxGuards])
      hoodData = await mysql.selectOne('SELECT id, owner, guards FROM hoods WHERE id=?', [hoodID])
    }

    const owner = hoodData.owner ? await getAllianceBasicData(hoodData.owner) : null

    hoods[index] = {
      id: hoodID,
      level: hoodLevel,
      name: generateHoodName(randomNumFn),
      guards: parseFloat(hoodData.guards),
      district,
      owner,
      info: hoodInfo,
    }
  })
}

function getHoodInfo(hoodLevel) {
  return {
    maxGuards: 10000 * Math.pow(1.5, hoodLevel - 1),
    guardsRegenerationPerDay: 5000 * Math.pow(1.5, hoodLevel - 1),
  }
}

prepareHoods().catch(console.error)
