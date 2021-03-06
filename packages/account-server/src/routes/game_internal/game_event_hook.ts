import express from 'express'
import { validateGameServerRequest } from '.'

import attackFinished from './game_event_hook/attack_finished'
import hookContestEnded from './game_event_hook/contest_ended'
import hookWarEnded from './game_event_hook/war_ended'
import hookGameEnded from './game_event_hook/game_ended'
import taskFinished from './game_event_hook/task_finished'

/* eslint-disable @typescript-eslint/camelcase */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hooksMap: any = {
  attack_finished: attackFinished,
  contest_ended: hookContestEnded,
  war_ended: hookWarEnded,
  game_ended: hookGameEnded,
  task_finished: taskFinished,
}
/* eslint-enable @typescript-eslint/camelcase */

export default (app: express.Application): void => {
  app.post('/v1/game_internal/game_event_hook', async function(req, res) {
    if (!validateGameServerRequest(req)) {
      res.status(401).json({ error: 'Invalid secret' })
      return
    }

    const eventID: string = req.body.eventID
    const hookFn = hooksMap[eventID]
    if (!eventID || !hookFn) {
      res.status(401).json({ error: 'Invalid eventID' })
      return
    }

    await hookFn(req.body.eventData)

    res.json({
      success: 1,
    })
  })
}
