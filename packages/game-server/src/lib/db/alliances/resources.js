import mysql from '../../mysql'
import { getUserAllianceID } from '.'

export async function allianceUpdateResource({ type, resourceID, resourceDiff, userID }) {
  const userAllianceID = await getUserAllianceID(userID)

  const updateResult = await mysql.query(
    'UPDATE alliances_resources SET quantity=quantity+? WHERE alliance_id=? AND resource_id=?',
    [resourceDiff, userAllianceID, resourceID]
  )

  if (updateResult.changedRows === 0) {
    await mysql.query('INSERT INTO alliances_resources (alliance_id, resource_id, quantity) VALUES (?, ?, 0)', [
      userAllianceID,
      resourceID,
    ])
  }

  // TODO: Clean up history when possible (Ex: multiple consecutive refills)

  await mysql.query(
    'INSERT INTO alliances_resources_log (alliance_id, user_id, created_at, resource_id, type, quantity) VALUES (?, ?, ?, ?, ?, ?)',
    [userAllianceID, userID, Math.floor(Date.now() / 1000), resourceID, type, Math.abs(resourceDiff)]
  )
}
