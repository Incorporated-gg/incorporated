const mysql = require('../lib/mysql')
const alliances = require('../lib/db/alliances')
const { calcResourceGeneration, calcResourceMax } = require('shared-lib/allianceUtils')
const frequencyMs = 15 * 1000 // 15 for dev. 60 should be fine for prod, but can be tuned if needed

async function generateResource(data, resourceID) {
  const max = calcResourceMax(resourceID, data.researchs)
  if (data.resources[resourceID].quantity >= max) return
  if (data.resources[resourceID].quantity === 0) {
    const [[rowExists]] = await mysql.query('SELECT 1 FROM alliances_resources WHERE alliance_id=? AND resource_id=?', [
      data.id,
      resourceID,
    ])
    if (!rowExists) {
      await mysql.query('INSERT INTO alliances_resources (quantity, alliance_id, resource_id) VALUES (?, ?, ?)', [
        0,
        data.id,
        resourceID,
      ])
    }
  }

  const genPerDay = calcResourceGeneration(resourceID, data.researchs)
  let generated = (genPerDay / 24 / 60 / 60 / 1000) * frequencyMs
  const maxDiff = max - (data.resources[resourceID].quantity + generated)
  if (maxDiff < 0) generated += maxDiff
  await mysql.query('UPDATE alliances_resources SET quantity=quantity+? WHERE alliance_id=? AND resource_id=?', [
    generated,
    data.id,
    resourceID,
  ])
}

const run = async () => {
  const [alliancesList] = await mysql.query('SELECT id FROM alliances')
  await Promise.all(
    alliancesList.map(async alliance => {
      const data = await alliances.getPrivateData(alliance.id)

      await Promise.all([
        generateResource(data, 'money'),
        generateResource(data, 'guards'),
        generateResource(data, 'sabots'),
      ])
    })
  )
}

module.exports = {
  run,
  frequencyMs,
}
