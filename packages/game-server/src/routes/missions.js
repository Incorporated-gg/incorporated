const mysql = require('../lib/mysql')
const { getMissions, getPersonnel, hasActiveMission } = require('../lib/db/users')
const { getUserAllianceID } = require('../lib/db/alliances')
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
      mission,
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

    if (await hasActiveMission(req.userData.id)) {
      res.status(400).json({
        error: 'Ya tienes una misión en curso',
      })
      return
    }

    const [targetUser] = await mysql.query('SELECT id FROM users WHERE username = ?', [req.body.target_user])
    if (!targetUser) {
      res.status(400).json({
        error: 'El usuario indicado no existe',
      })
      return
    }

    const missionType = req.body.missionType

    const sentSpies = parseInt(req.body.sent_spies) || 0
    const sentSabots = parseInt(req.body.sent_sabots) || 0
    const sentThieves = parseInt(req.body.sent_thieves) || 0
    const targetBuilding = req.body.target_building ? parseInt(req.body.target_building) : undefined

    const userPersonnel = await getPersonnel(req.userData.id)
    switch (missionType) {
      case 'attack': {
        if (!buildingsList.find(b => b.id === targetBuilding)) {
          res.status(400).json({ error: 'El edificio enviado no existe' })
          return
        }
        // Ensure daily defenses limit
        const targetUserMissions = await getMissions(targetUser.id)
        if (targetUserMissions.receivedToday >= targetUserMissions.maxDefenses) {
          res.status(400).json({ error: `Este usuario ya ha sido atacado ${targetUserMissions.maxDefenses} veces hoy` })
          return
        }
        if (sentSabots + sentThieves < 1) {
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
        if (userPersonnel.thieves < sentThieves) {
          res.status(400).json({
            error: 'No tienes suficientes ladrones',
          })
          return
        }
        const attackedAllianceID = await getUserAllianceID(targetUser.id)
        const myAllianceID = await getUserAllianceID(req.userData.id)
        if (attackedAllianceID === myAllianceID) {
          res.status(400).json({
            error: 'No puedes atacar a alguien de tu alianza',
          })
          return
        }

        // Ensure daily attacks limit
        const userMissions = await getMissions(req.userData.id)
        if (userMissions.sentToday >= userMissions.maxAttacks) {
          res.status(400).json({ error: `Ya has atacado ${userMissions.maxAttacks} veces hoy` })
          return
        }
        break
      }
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
    const data = {}
    if (missionType === 'spy') {
      data.spies = sentSpies
    } else if (missionType === 'attack') {
      data.building = targetBuilding
      data.sabots = sentSabots
      data.thieves = sentThieves
    }
    await mysql.query(
      'INSERT INTO missions (user_id, mission_type, data, target_user, started_at, will_finish_at) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userData.id, missionType, JSON.stringify(data), targetUser.id, tsNow, tsNow + missionDuration]
    )
    res.json({
      success: true,
    })
  })
}
