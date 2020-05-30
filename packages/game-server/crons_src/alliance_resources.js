import mysql from '../src/lib/mysql'
import { getAllianceResources, getAllianceResearchs } from '../src/lib/db/alliances'
import { calcAllianceResourceGeneration, calcAllianceResourceMax } from 'shared-lib/allianceUtils'
const frequencyMs = 15 * 1000 // 15 for dev. 60 should be fine for prod, but can be tuned if needed

const mapResourceIDToResearchID = {
  guards: 2,
  sabots: 3,
  thieves: 4,
}

async function generateResource(allianceID, resourceID, resources, researchs) {
  const researchID = mapResourceIDToResearchID[resourceID]
  const researchLevel = researchs[researchID].level
  const max = calcAllianceResourceMax(researchID, researchLevel)

  if (resources[resourceID] >= max) return
  if (resources[resourceID] === 0) {
    const rowExists = await mysql.selectOne('SELECT 1 FROM alliances_resources WHERE alliance_id=? AND resource_id=?', [
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

  const genPerDay = calcAllianceResourceGeneration(researchID, researchLevel)

  let generated = (genPerDay / 24 / 60 / 60 / 1000) * frequencyMs
  const maxDiff = max - (resources[resourceID] + generated)
  if (maxDiff < 0) generated += maxDiff
  await mysql.query('UPDATE alliances_resources SET quantity=quantity+? WHERE alliance_id=? AND resource_id=?', [
    generated,
    allianceID,
    resourceID,
  ])
}

const run = async () => {
  const alliancesList = await mysql.query('SELECT id FROM alliances')
  await Promise.all(
    alliancesList.map(async alliance => {
      const [resources, researchs] = await Promise.all([
        getAllianceResources(alliance.id),
        getAllianceResearchs(alliance.id),
      ])

      await Promise.all([
        generateResource(alliance.id, 'guards', resources, researchs),
        generateResource(alliance.id, 'sabots', resources, researchs),
        generateResource(alliance.id, 'thieves', resources, researchs),
      ])
    })
  )
}

module.exports = {
  run,
  frequencyMs,
}
