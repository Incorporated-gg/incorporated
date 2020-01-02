const mysql = require('../lib/mysql')
const alliances = require('../lib/db/alliances')
const { calcResourceGeneration, calcResourceMax } = require('shared-lib/allianceUtils')
const frequencyMs = 15 * 1000 // 15 for dev. 60 should be fine for prod, but can be tuned if needed

async function generateResource(allianceID, resourceID, resources, researchs) {
  const max = calcResourceMax(resourceID, researchs)
  if (resources[resourceID].quantity >= max) return
  if (resources[resourceID].quantity === 0) {
    const [[rowExists]] = await mysql.query('SELECT 1 FROM alliances_resources WHERE alliance_id=? AND resource_id=?', [
      allianceID,
      resourceID,
    ])
    if (!rowExists) {
      await mysql.query('INSERT INTO alliances_resources (quantity, alliance_id, resource_id) VALUES (?, ?, ?)', [
        0,
        allianceID,
        resourceID,
      ])
    }
  }

  const genPerDay = calcResourceGeneration(resourceID, researchs)
  let generated = (genPerDay / 24 / 60 / 60 / 1000) * frequencyMs
  const maxDiff = max - (resources[resourceID].quantity + generated)
  if (maxDiff < 0) generated += maxDiff
  await mysql.query('UPDATE alliances_resources SET quantity=quantity+? WHERE alliance_id=? AND resource_id=?', [
    generated,
    allianceID,
    resourceID,
  ])
}

const run = async () => {
  const [alliancesList] = await mysql.query('SELECT id FROM alliances')
  await Promise.all(
    alliancesList.map(async alliance => {
      const [resources, researchs] = await Promise.all([
        alliances.getResources(alliance.id),
        alliances.getResearchs(alliance.id),
      ])

      await Promise.all([
        generateResource(alliance.id, 'money', resources, researchs),
        generateResource(alliance.id, 'guards', resources, researchs),
        generateResource(alliance.id, 'sabots', resources, researchs),
      ])
    })
  )
}

module.exports = {
  run,
  frequencyMs,
}
