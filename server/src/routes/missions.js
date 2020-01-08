const mysql = require('../lib/mysql')
const { getMissions, getPersonnel } = require('../lib/db/users')
const { buildingsList } = require('shared-lib/buildingsUtils')
const { calculateMissionTime } = require('shared-lib/missionsUtils')

module.exports = app => {
  app.get('/v1/missions', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const missions = await getMissions(req.userData.id)
    res.json({
      missions,
    })
  })

  app.post('/v1/missions/cancel', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [
      [mission],
    ] = await mysql.query('SELECT id, mission_type FROM missions WHERE user_id=? AND completed=? AND started_at=?', [
      req.userData.id,
      false,
      req.body.started_at,
    ])
    if (!mission) {
      res.status(400).json({
        error: 'Misión no encontrada',
      })
      return
    }

    // Update
    await mysql.query('DELETE FROM missions WHERE id=?', [mission.id])

    res.json({
      success: true,
    })
  })

  app.post('/v1/missions', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const missions = await getMissions(req.userData.id)
    if (missions.filter(m => !m.completed).length) {
      res.status(400).json({
        error: 'Ya tienes una misión en curso',
      })
      return
    }

    const [[toUser]] = await mysql.query('SELECT id FROM users WHERE username = ?', [req.body.target_user])
    if (!toUser) {
      res.status(400).json({
        error: 'El usuario indicado no existe',
      })
      return
    }

    const missionType = req.body.missionType

    const sentSpies = parseInt(req.body.sent_spies) || undefined
    const sentSabots = parseInt(req.body.sent_sabots) || undefined
    const sentThiefs = parseInt(req.body.sent_thiefs) || undefined
    const targetBuilding = req.body.target_building ? parseInt(req.body.target_building) : undefined

    const userPersonnel = await getPersonnel(req.userData.id)
    switch (missionType) {
      case 'attack':
        if (!buildingsList.find(b => b.id === targetBuilding)) {
          res.status(400).json({ error: 'El edificio enviado no existe' })
          return
        }
        if (sentSabots + sentThiefs < 1) {
          res.status(400).json({
            error: 'Debes enviar algunos saboteadores o ladrones',
          })
          return
        }
        if (userPersonnel.sabots < sentSabots) {
          res.status(400).json({
            error: 'No tienes suficientes saboteadores',
          })
          return
        }
        if (userPersonnel.thiefs < sentThiefs) {
          res.status(400).json({
            error: 'No tienes suficientes ladrones',
          })
          return
        }

        // Ensure daily attacks limit
        const MAX_DAILY_SABOTS = process.env.NODE_ENV === 'dev' ? 999 : 3
        const now = new Date()
        const dailyCountStartedAtTimeString = `${now.getUTCFullYear()}-${now.getUTCMonth() +
          1}-${now.getUTCDate()} 00:00:00`
        const dailyCountStartedAt = Math.floor(new Date(dailyCountStartedAtTimeString).getTime() / 1000)
        const [
          [{ count }],
        ] = await mysql.query(
          'SELECT COUNT(*) AS count FROM missions WHERE user_id=? AND mission_type=? AND started_at>?',
          [req.userData.id, missionType, dailyCountStartedAt]
        )
        if (count >= MAX_DAILY_SABOTS) {
          res.status(400).json({ error: `Ya has atacado ${MAX_DAILY_SABOTS} veces hoy` })
          return
        }
        break
      case 'spy':
        if (sentSpies < 1) {
          res.status(400).json({
            error: 'Debes enviar algunos espías',
          })
          return
        }
        if (userPersonnel.spies < sentSpies) {
          res.status(400).json({
            error: 'No tienes suficientes espías',
          })
          return
        }

        break
      default:
        res.status(400).json({
          error: 'Tipo de misión no soportada',
        })
        return
    }

    const missionDuration = calculateMissionTime(missionType)
    const tsNow = Math.floor(Date.now() / 1000)
    const data = JSON.stringify({
      building: targetBuilding,
      spies: sentSpies,
      sabots: sentSabots,
      thiefs: sentThiefs,
    })
    await mysql.query(
      'INSERT INTO missions (user_id, mission_type, data, target_user, started_at, will_finish_at) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userData.id, missionType, data, toUser.id, tsNow, tsNow + missionDuration]
    )
    res.json({
      success: true,
    })
  })
}
