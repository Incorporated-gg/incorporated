const mysql = require('../lib/mysql')
const buildingsUtils = require('../lib/buildingsUtils')

module.exports = app => {
  app.get('/v1/buildings', async function(req, res) {
    if (!req.userData) {
      res.status(401).send({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const buildings = {}
    buildingsUtils.buildingsList.forEach(building => (buildings[building.id] = 0))

    const [buildingsRaw] = await mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [req.userData.id])
    if (buildingsRaw) buildingsRaw.forEach(building => (buildings[building.id] = building.quantity))

    res.send({
      buildings,
    })
  })

  app.post('/v1/buy_buildings', async function(req, res) {
    if (!req.userData) {
      res.status(401).send({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.building_id || !req.body.count) {
      res.status(400).send({ error: 'Faltan datos' })
      return
    }
    const buildingID = req.body.building_id
    const count = 1 // TODO: Use req.body.count

    if (!buildingsUtils.buildingsList.find(b => b.id === buildingID)) {
      res.status(400).send({ error: 'Invalid building_id' })
      return
    }

    const [[building]] = await mysql.query('SELECT quantity FROM buildings WHERE user_id=? and id=?', [
      req.userData.id,
      buildingID,
    ])
    const price = buildingsUtils.calcBuildingPrice(buildingID, building ? building.quantity : 0)
    if (price > req.userData.money) {
      res.status(400).send({ error: 'No tienes suficiente dinero' })
      return
    }

    req.userData.money -= price
    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])

    if (!building) {
      await mysql.query('INSERT INTO buildings (user_id, id, quantity) VALUES (?, ?, ?)', [
        req.userData.id,
        buildingID,
        1,
      ])
    } else {
      await mysql.query('UPDATE buildings SET quantity=quantity+1 WHERE user_id=? and id=?', [
        req.userData.id,
        buildingID,
        1,
      ])
    }

    if (count > 1) throw new Error('Not implemented yet')

    res.send({
      success: true,
    })
  })
}
