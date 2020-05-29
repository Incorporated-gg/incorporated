import mysql from '../src/lib/mysql'
import { getAllHoodsData } from '../src/lib/db/hoods'
import { calcHoodMaxGuards, calcHoodGuardsRegenerationPerDay } from 'shared-lib/hoodUtils'
const frequencyMs = 60 * 1000

async function generateHoodGuards(hoodData) {
  if (!hoodData) return // hood not in db

  const maxGuards = calcHoodMaxGuards(hoodData.level)
  const guardsRegenerationPerDay = calcHoodGuardsRegenerationPerDay(hoodData.level)
  if (hoodData.guards >= maxGuards) return

  let generatedGuards = (guardsRegenerationPerDay / 24 / 60 / 60 / 1000) * frequencyMs
  const maxDiff = maxGuards - (hoodData.guards + generatedGuards)
  if (maxDiff < 0) generatedGuards += maxDiff

  await mysql.query('UPDATE hoods SET guards=guards+? WHERE id=?', [generatedGuards, hoodData.id])
}

const run = async () => {
  const allHoodsData = await getAllHoodsData()
  await Promise.all(allHoodsData.map(generateHoodGuards))
}

module.exports = {
  run,
  frequencyMs,
}
