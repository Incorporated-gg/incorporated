import mysql from '../lib/mysql'
import { getWarData } from '../lib/db/alliances'
import { getMaxHoodsAttackedPerWar } from 'shared-lib/allianceUtils'
import { getServerDay } from '../lib/serverTime'
import { isHoodInWar } from '../routes/alliances/war'
const frequencyMs = 5 * 60 * 1000

async function run() {
  const maxCreatedAt = Math.floor(Date.now() / 1000) - 60 * 60 * 24
  const wars = await mysql.query(
    'SELECT id FROM alliances_wars WHERE completed=0 AND alliance1_hoods IS NULL AND created_at<?',
    [maxCreatedAt]
  )
  await Promise.all(wars.map(war => autoselectHoodsForWar(war.id)))
}

async function autoselectHoodsForWar(warID) {
  const warData = await getWarData(warID)

  // Get shuffled alliance1 hoods
  let allAlliance1Hoods = await mysql.query('SELECT id FROM hoods WHERE owner=?', [warData.alliance1.id])
  allAlliance1Hoods = allAlliance1Hoods
    .map(h => parseInt(h.id))
    .map(a => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1])

  // Filter out those already in war
  let selectedHoods = await Promise.all(
    allAlliance1Hoods.map(async hoodID => {
      const isInWar = await isHoodInWar(hoodID)
      return { isInWar, hoodID }
    })
  )
  selectedHoods = selectedHoods.filter(({ isInWar }) => !isInWar).map(({ hoodID }) => hoodID)

  // Select only max count of hoods
  selectedHoods = selectedHoods.slice(0, getMaxHoodsAttackedPerWar(getServerDay()))

  const alliance1Hoods = selectedHoods.join(',')
  await mysql.query('UPDATE alliances_wars SET alliance1_hoods=? WHERE id=?', [alliance1Hoods, warID])
}

module.exports = {
  run,
  frequencyMs,
}
