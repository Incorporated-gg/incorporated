import { completeTask } from '../lib/db/tasks'
import { sendAccountHook } from '../lib/accountInternalApi'

module.exports = app => {
  app.post('/v1/tasks/complete', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const taskID = req.body.task_id
    const taskCompletion = await completeTask(req.userData.id, taskID)
    if (!taskCompletion) {
      res.status(400).json({
        error: 'Failed to complete task',
      })
      return
    }
    req.userData.money += taskCompletion.moneyReward

    sendAccountHook('task_finished', { userID: req.userData.id, taskID })

    res.json({
      success: true,
    })
  })
}
