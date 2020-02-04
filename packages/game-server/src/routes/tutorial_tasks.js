import { completeCurrentTask } from '../lib/db/tutorialTasks'

module.exports = app => {
  app.post('/v1/tutorial_tasks/complete', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    await completeCurrentTask(req.userData.id)

    res.json({
      success: true,
    })
  })
}
