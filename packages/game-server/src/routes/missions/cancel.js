import mysql from '../../lib/mysql'
import { updatePersonnelAmount } from '../../lib/db/personnel'
import { allianceUpdateResource } from '../../lib/db/alliances/resources'
import { getUserAllianceID } from '../../lib/db/alliances'

module.exports = app => {
  app.post('/v1/missions/cancel', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const mission = await mysql.selectOne(
      'SELECT id, mission_type, data FROM missions WHERE user_id=? AND completed=? AND started_at=?',
      [req.userData.id, false, req.body.started_at]
    )
    if (!mission) {
      res.status(400).json({
        error: 'Misión no encontrada',
      })
      return
    }

    const allianceID = await getUserAllianceID(req.userData.id)

    // Update
    await mysql.query('DELETE FROM missions WHERE id=?', [mission.id])

    const data = JSON.parse(mission.data)
    if (mission.mission_type === 'attack') {
      if (data.thievesExtractedFromCorp > 0) {
        await allianceUpdateResource({
          type: 'deposit',
          resourceID: 'thieves',
          resourceDiff: data.thievesExtractedFromCorp,
          userID: req.userData.id,
          allianceID,
        })
        await updatePersonnelAmount(req, 'thieves', -data.thievesExtractedFromCorp)
      }
      if (data.sabotsExtractedFromCorp > 0) {
        await allianceUpdateResource({
          type: 'deposit',
          resourceID: 'sabots',
          resourceDiff: data.sabotsExtractedFromCorp,
          userID: req.userData.id,
          allianceID,
        })
        await updatePersonnelAmount(req, 'sabots', -data.sabotsExtractedFromCorp)
      }
    }

    res.json({
      success: true,
    })
  })
}
