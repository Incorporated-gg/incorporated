import { hoods } from '../lib/map'
import mysql from '../lib/mysql'
const frequencyMs = 15 * 1000 // 15 for dev. 60 should be fine for prod, but can be tuned if needed

async function generateHoodGuards(hood) {
  const maxGuards = hood.info.maxGuards
  const currentGuards = hood.guards
  const genPerDay = hood.info.guardsRegenerationPerDay

  if (currentGuards >= maxGuards) return

  let generatedGuards = (genPerDay / 24 / 60 / 60 / 1000) * frequencyMs
  const maxDiff = maxGuards - (currentGuards + generatedGuards)
  if (maxDiff < 0) generatedGuards += maxDiff

  hood.guards += generatedGuards
  await mysql.query('UPDATE hoods SET guards=guards+? WHERE id=?', [generatedGuards, hood.id])
}

const run = async () => {
  await Promise.all(hoods.map(generateHoodGuards))
}

module.exports = {
  run,
  frequencyMs,
}
