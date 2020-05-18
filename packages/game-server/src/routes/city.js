import { getAllHoodsData, getHoodData } from '../lib/db/hoods'
import { getUserAllianceID } from '../lib/db/alliances'
import { calcHoodMaxGuards, calcHoodUpgradePrice } from 'shared-lib/hoodUtils'
import { getUserPersonnel } from '../lib/db/users'
import mysql from '../lib/mysql'

module.exports = app => {
  app.get('/v1/city', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const hoods = await getAllHoodsData()

    res.json({
      hoods,
    })
  })

  app.post('/v1/city/hood_upgrade', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const hoodID = parseInt(req.body.hood_id)
    const hoodData = await getHoodData(hoodID)
    if (!(await validateValidAndOwnedHood({ hoodData, req, res }))) return // Response already handled

    const upgradeCost = calcHoodUpgradePrice(hoodData.level)
    if (upgradeCost > req.userData.money) {
      res.status(400).json({ error: 'No tienes suficiente dinero' })
      return false
    }

    req.userData.money -= upgradeCost
    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [upgradeCost, req.userData.id])
    await mysql.query('UPDATE hoods SET level=level+1 WHERE id=?', [hoodID])

    res.json({ success: true })
  })

  app.post('/v1/city/hood_add_guards', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const hoodID = parseInt(req.body.hood_id)
    const hoodData = await getHoodData(hoodID)
    if (!(await validateValidAndOwnedHood({ hoodData, req, res }))) return // Response already handled

    const addedGuards = parseInt(req.body.guards)
    if (hoodData.guards + addedGuards > calcHoodMaxGuards(hoodData.level)) {
      res.status(400).json({ error: 'Esto superaría el límite de guardias' })
      return false
    }

    const userPersonnel = await getUserPersonnel(req.userData.id)
    if (addedGuards < 1 || addedGuards > userPersonnel.guards) {
      res.status(400).json({ error: 'No tienes suficientes guardias' })
      return false
    }

    await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? AND resource_id="guards"', [
      addedGuards,
      req.userData.id,
    ])
    await mysql.query('UPDATE hoods SET guards=guards+? WHERE id=?', [addedGuards, hoodID])

    res.json({ success: true })
  })
}

async function validateValidAndOwnedHood({ hoodData, req, res }) {
  if (!hoodData) {
    res.status(400).json({ error: 'Barrio no encontrado' })
    return false
  }
  const userAllianceID = await getUserAllianceID(req.userData.id)
  if (!userAllianceID || !hoodData.owner || userAllianceID !== hoodData.owner.id) {
    res.status(400).json({ error: 'Este barrio no te pertenece' })
    return false
  }

  return true
}
