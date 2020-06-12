import { Application } from 'express'
import { validateIsAdmin } from './'
import {
  getLatestActivityLogs,
  getUserActivityLogs,
  getActiveUsersForLastDaysCount,
  getUniqueUserIpsForLastDays,
  getMultiAccounts,
} from '../../lib/db/activity-trail'
import { getIDFromUsername } from '../../lib/db/users'

export default (app: Application): void => {
  app.get('/v1/admin/activity', validateIsAdmin, async function(req, res) {
    const logs = await getLatestActivityLogs(50)
    const activeUsers = await getActiveUsersForLastDaysCount(30)
    const uniqueIps = await getUniqueUserIpsForLastDays(30)
    const multis = await getMultiAccounts()

    res.json({
      latestActivity: logs,
      activeUsers,
      uniqueIps,
      multis,
    })
  })
  app.get('/v1/admin/activity/:userName', validateIsAdmin, async function(req, res) {
    const userId = await getIDFromUsername(req.params.userName)
    if (!userId) {
      res.status(404).json({
        error: 'User not found',
      })
      return
    }
    const logs = await getUserActivityLogs(userId)
    res.json(logs)
  })
}
