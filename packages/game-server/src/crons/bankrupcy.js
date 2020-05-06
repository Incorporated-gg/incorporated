import mysql from '../lib/mysql'
import { getUserPersonnel, getHasActiveMission } from '../lib/db/users'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
const frequencyMs = 60 * 1000

const BANKRUPCY_TIME_LIMIT = 60 * 60 // 1h
const TROOPS_LOSS_COEFICIENT = 0.001
const TROOPS_DELETION_ORDER = ['spies', 'sabots', 'thieves', 'guards']

const run = async () => {
  const tsNow = Math.floor(Date.now() / 1000)
  await mysql.query(
    'UPDATE users SET bankrupcy_started_at=? WHERE bankrupcy_started_at IS NULL AND money<0 AND (SELECT SUM(quantity) FROM users_resources WHERE users_resources.user_id=users.id)>0',
    [tsNow]
  )

  const bankruptedUsers = await mysql.query('SELECT id FROM users WHERE bankrupcy_started_at<?', [
    tsNow - BANKRUPCY_TIME_LIMIT,
  ])
  await Promise.all(
    bankruptedUsers.map(async bankruptedUser => {
      const userID = bankruptedUser.id

      const hasActiveMission = await getHasActiveMission(userID)
      if (hasActiveMission) return

      const personnel = await getUserPersonnel(userID)

      for (const troopType of TROOPS_DELETION_ORDER) {
        if (personnel[troopType] <= 0) continue

        const troopDailyMaintenanceCost = personnel[troopType] * PERSONNEL_OBJ[troopType].dailyMaintenanceCost
        const lost = Math.ceil((troopDailyMaintenanceCost / 24 / 60) * TROOPS_LOSS_COEFICIENT)
        await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
          lost,
          userID,
          troopType,
        ])
        return
      }

      // No troops left
      await mysql.query('UPDATE users SET bankrupcy_started_at=NULL WHERE id=?', [userID])
    })
  )
}

module.exports = {
  run,
  frequencyMs,
}
