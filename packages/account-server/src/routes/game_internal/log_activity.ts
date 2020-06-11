import { Application, Response, Request } from 'express'
import { validateGameServerRequest } from '.'
import { logUserActivity } from '../../lib/db/activity-trail'
import { ActivityTrailData } from 'shared-lib/activityTrailUtils'

export default (app: Application): void => {
  app.post('/v1/game_internal/log_activity', async function(req: Request, res: Response) {
    if (!validateGameServerRequest(req)) {
      res.status(401).json({ error: 'Invalid secret' })
      return
    }

    const logItem: ActivityTrailData = {
      userId: req.body.userId,
      date: req.body.date,
      ip: req.body.ip,
      type: req.body.type,
      message: req.body.message,
      extra: JSON.stringify(req.body.extra),
    }

    logUserActivity(logItem)

    res.json({
      success: 1,
    })
  })
}
