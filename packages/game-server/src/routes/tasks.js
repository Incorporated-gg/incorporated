import { completeTask } from '../lib/db/tasks'

module.exports = app => {
  app.post('/v1/tasks/complete', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const taskID = req.body.task_id
    const { moneyReward } = await completeTask(req.userData.id, taskID)
    req.userData.money += moneyReward

    res.json({
      success: true,
    })
  })
}
