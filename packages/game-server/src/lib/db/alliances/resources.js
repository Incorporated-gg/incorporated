import mysql from '../../mysql'

export async function allianceUpdateResource({ type, resourceID, resourceDiff, userID, allianceID }) {
  const updateResult = await mysql.query(
    'UPDATE alliances_resources SET quantity=quantity+? WHERE alliance_id=? AND resource_id=?',
    [resourceDiff, allianceID, resourceID]
  )

  if (updateResult.changedRows === 0) {
    await mysql.query('INSERT INTO alliances_resources (alliance_id, resource_id, quantity) VALUES (?, ?, 0)', [
      allianceID,
      resourceID,
    ])
  }

  // TODO: Clean up history when possible (Ex: multiple consecutive refills)

  await mysql.query(
    'INSERT INTO alliances_resources_log (alliance_id, user_id, created_at, resource_id, type, quantity) VALUES (?, ?, ?, ?, ?, ?)',
    [allianceID, userID, Math.floor(Date.now() / 1000), resourceID, type, Math.abs(resourceDiff)]
  )
}
