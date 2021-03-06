import tasksProgressHook from '../lib/db/tasks/tasksProgressHook'
import mysql from '../lib/mysql'
import { buildingsList, calcBuildingPrice } from 'shared-lib/buildingsUtils'
import { logUserActivity, getIpFromRequest } from '../lib/accountInternalApi'
import { ActivityTrailType } from 'shared-lib/activityTrailUtils'

module.exports = app => {
  app.post('/v1/buildings/buy', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.building_id || !req.body.count) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }
    const buildingID = req.body.building_id
    const count = 1 // TODO: Use req.body.count
    if (count > 1) throw new Error('Not implemented yet')

    const buildingInfo = buildingsList.find(b => b.id === buildingID)
    if (!buildingInfo) {
      res.status(400).json({ error: 'Invalid building_id' })
      return
    }

    const currentOptimizeLvl = req.userData.researchs[5]
    const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel
    if (!hasEnoughOptimizeLvl) {
      res.status(400).json({ error: 'No tienes suficiente nivel de oficina central' })
      return
    }

    const building = await mysql.selectOne('SELECT quantity FROM buildings WHERE user_id=? and id=?', [
      req.userData.id,
      buildingID,
    ])
    const price = calcBuildingPrice(buildingID, building ? building.quantity : 0)
    if (price > req.userData.money) {
      res.status(400).json({ error: 'No tienes suficiente dinero' })
      return
    }

    req.userData.money -= price
    mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])

    const updateResult = await mysql.query('UPDATE buildings SET quantity=quantity+? WHERE user_id=? and id=?', [
      1,
      req.userData.id,
      buildingID,
    ])
    if (updateResult.changedRows === 0) {
      await mysql.query('INSERT INTO buildings (user_id, id, quantity) VALUES (?, ?, ?)', [
        req.userData.id,
        buildingID,
        1,
      ])
    }
    req.userData.buildings[buildingID].quantity += 1

    await tasksProgressHook(req.userData.id, 'build_building', {
      buildingID,
    })

    logUserActivity({
      userId: req.userData.id,
      date: Date.now(),
      ip: getIpFromRequest(req),
      message: '',
      type: ActivityTrailType.BUILDING_BOUGHT,
      extra: {
        buildingID,
      },
    })

    res.json({
      success: true,
    })
  })

  app.post('/v1/buildings/extract_money', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.building_id) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }
    const buildingID = req.body.building_id

    const buildingInfo = buildingsList.find(b => b.id === buildingID)
    if (!buildingInfo) {
      res.status(400).json({ error: 'Invalid building_id' })
      return
    }

    const extractedMoney = req.userData.buildings[buildingID].money
    if (extractedMoney > 0) {
      await mysql.query('UPDATE users SET money=money+? WHERE id=?', [extractedMoney, req.userData.id])
      req.userData.money += extractedMoney
      await mysql.query('UPDATE buildings SET money=0 WHERE user_id=? and id=?', [req.userData.id, buildingID])
      req.userData.buildings[buildingID].money = 0
    }

    await tasksProgressHook(req.userData.id, 'extracted_money', {
      extractedMoney,
    })

    logUserActivity({
      userId: req.userData.id,
      date: Date.now(),
      ip: getIpFromRequest(req),
      message: '',
      type: ActivityTrailType.BUILDING_EXTRACT,
      extra: {
        buildingID,
        extractedMoney,
      },
    })

    res.json({
      success: true,
    })
  })
}
