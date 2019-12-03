const mysql = require('../lib/mysql')
const { getMissions, getPersonnel, getBuildings } = require('../lib/db/users')
const { buildingsList } = require('shared-lib/buildingsUtils')

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

    const userPersonnel = await getPersonnel(req.userData.id)
    switch (req.body.missionType) {
      case 'attack':
        if (userPersonnel.sabots < req.body.personnel_sent) {
          res.status(400).json({
            error: 'No tienes suficientes saboteadores',
          })
          return
        }
        if (!req.body.target_building || !req.body.target_user || !req.body.personnel_sent) {
          res.status(400).json({ error: 'Faltan parámetros' })
          return
        }
        if (!buildingsList.find(b => b.id === parseInt(req.body.target_building))) {
          res.status(400).json({ error: 'El edificio enviado no existe' })
          return
        }
        break
      case 'spy':
        res.status(400).json({
          error: 'No implementado',
        })
        return
      /* if (userPersonnel.spies < req.body.personnel_sent) {
          res.status(400).json({
            error: 'No tienes suficientes espías',
          })
          return
        }
        if (!req.body.target_user || !req.body.personnel_sent) {
          res.status(400).json({ error: 'Faltan parámetros' })
          return
        }
        break */
      default:
        res.status(400).json({
          error: 'Tipo de misión no soportada',
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

    const defensorBuildings = await getBuildings(toUser.id)
    console.log('DEFENSOR BUILDINGS' + JSON.stringify(defensorBuildings))
    if (!defensorBuildings[parseInt(req.body.target_building)]) {
      res.status(400).json({
        error: `El usuario que intentas atacar no tiene ${
          buildingsList.find(b => b.id === parseInt(req.body.target_building)).name
        }`,
      })
      return
    }

    if (req.body.personnel_sent < 1) {
      res.status(400).json({
        error: 'Debes enviar algunas tropas',
      })
      return
    }

    const troopType = req.body.missionType === 'attack' ? 'sabots' : 'spies'
    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id=?', [
      req.body.personnel_sent,
      req.userData.id,
      troopType,
    ])
    await mysql.query(
      'INSERT INTO missions (user_id, mission_type, target_building, target_user, personnel_sent, started_at, will_finish_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.userData.id,
        req.body.missionType,
        req.body.target_building,
        toUser.id,
        req.body.personnel_sent,
        Date.now() / 1000,
        Date.now() / 1000 + 15,
      ]
    )
    res.json({
      success: true,
    })
  })
}
