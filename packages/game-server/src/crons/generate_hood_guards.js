import mysql from '../lib/mysql'
import { getAllHoodsData } from '../lib/db/hoods'
const frequencyMs = 60 * 1000

async function generateHoodGuards(hoodData) {
  if (hoodData.guards >= hoodData.maxGuards) return

  let generatedGuards = (hoodData.guardsRegenerationPerDay / 24 / 60 / 60 / 1000) * frequencyMs
  const maxDiff = hoodData.maxGuards - (hoodData.guards + generatedGuards)
  if (maxDiff < 0) generatedGuards += maxDiff

  await mysql.query('UPDATE hoods SET guards=guards+? WHERE id=?', [generatedGuards, hoodData.id])
}

const run = async () => {
  const allHodsData = await getAllHoodsData()
  await Promise.all(allHodsData.map(generateHoodGuards))
}

module.exports = {
  run,
  frequencyMs,
}
