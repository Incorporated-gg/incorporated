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

  const tsNow = Math.floor(Date.now() / 1000)
  const tsLimit = tsNow - 60 * 30 // 30min
  const recentLogForResource = await mysql.selectOne(
    'SELECT type, quantity FROM alliances_resources_log WHERE alliance_id=? AND user_id=? AND created_at>? AND resource_id=? AND (type="extract" OR type="deposit")',
    [allianceID, userID, tsLimit, resourceID]
  )

  if (!recentLogForResource) {
    await mysql.query(
      'INSERT INTO alliances_resources_log (alliance_id, user_id, created_at, resource_id, type, quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [allianceID, userID, tsNow, resourceID, type, Math.abs(resourceDiff)]
    )
    return
  }

  const recentDiff = recentLogForResource.quantity * (recentLogForResource.type === 'extract' ? -1 : 1)
  const newResourceDiff = resourceDiff + recentDiff
  if (newResourceDiff === 0) {
    await mysql.query(
      'DELETE FROM alliances_resources_log WHERE alliance_id=? AND user_id=? AND created_at>? AND resource_id=? AND (type="extract" OR type="deposit")',
      [allianceID, userID, tsLimit, resourceID]
    )
    return
  }

  const newType = newResourceDiff < 0 ? 'extract' : 'deposit'
  await mysql.query(
    'UPDATE alliances_resources_log SET type=?, quantity=?, created_at=? WHERE alliance_id=? AND user_id=? AND created_at>? AND resource_id=? AND (type="extract" OR type="deposit")',
    [newType, Math.abs(newResourceDiff), tsNow, allianceID, userID, tsLimit, resourceID]
  )
}
