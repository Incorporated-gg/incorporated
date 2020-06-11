import { Application } from 'express'
import { validateIsAdmin } from './'
import { getLatestActivityLogs, getUserActivityLogs } from '../../lib/db/activity-trail'
import { getIDFromUsername } from '../../lib/db/users'

export default (app: Application): void => {
  app.get('/v1/admin/users/activity', validateIsAdmin, async function(req, res) {
    const logs = await getLatestActivityLogs(50)
    res.json(logs)
  })
  app.get('/v1/admin/users/:userName/activity', validateIsAdmin, async function(req, res) {
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
