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

    const personnelSent = parseInt(req.body.personnel_sent)
    const targetBuilding = req.body.target_building ? parseInt(req.body.target_building) : null

    if (personnelSent < 1) {
      res.status(400).json({
        error: 'Debes enviar algunas tropas',
      })
      return
    }

    let troopType
    const userPersonnel = await getPersonnel(req.userData.id)
    switch (req.body.missionType) {
      case 'attack':
        troopType = 'sabots'

        if (!buildingsList.find(b => b.id === targetBuilding)) {
          res.status(400).json({ error: 'El edificio enviado no existe' })
          return
        }
        // Is this error needed? :
        /* const defensorBuildings = await getBuildings(toUser.id)
        if (!defensorBuildings[targetBuilding]) {
          res.status(400).json({
            error: `El usuario que intentas atacar no tiene ${
              buildingsList.find(b => b.id === targetBuilding).name
            }`,
          })
          return
        } */
        break
      case 'hack':
        troopType = 'hackers'
        if (personnelSent > 40) {
          res.status(400).json({
            error: 'Solo puedes mandar un máximo de 40 hackers',
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

    if (userPersonnel[troopType] < personnelSent) {
      res.status(400).json({
        error: 'No tienes suficientes tropas',
      })
      return
    }

    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      personnelSent,
      req.userData.id,
      troopType,
    ])

    const missionDuration = calculateMissionTime(req.body.missionType, personnelSent)
    const tsNow = Math.floor(Date.now() / 1000)
    await mysql.query(
      'INSERT INTO missions (user_id, mission_type, target_building, target_user, personnel_sent, started_at, will_finish_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userData.id, req.body.missionType, targetBuilding, toUser.id, personnelSent, tsNow, tsNow + missionDuration]
    )
    res.json({
      success: true,
    })
  })
}
