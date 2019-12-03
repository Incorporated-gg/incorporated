const mysql = require('../lib/mysql')
const users = require('../lib/db/users')
const { researchList, calcResearchPrice } = require('shared-lib/researchUtils')

module.exports = app => {
  app.get('/v1/research', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    res.json({
      researchs: req.userData.researchs,
    })
  })

  app.post('/v1/research/buy', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.research_id || !req.body.count) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }
    const researchID = req.body.research_id
    const count = 1 // TODO: Use req.body.count
    if (count > 1) throw new Error('Not implemented yet')

    if (!researchList.find(b => b.id === researchID)) {
      res.status(400).json({ error: 'Invalid research_id' })
      return
    }

    const researchs = await users.getResearchs(req.userData.id)

    const price = calcResearchPrice(researchID, researchs[researchID])
    if (price > req.userData.money) {
      res.status(400).json({ error: 'No tienes suficiente dinero' })
      return
    }

    req.userData.money -= price
    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])

    const researchRowExists = researchs[researchID] !== 1
    if (!researchRowExists) {
      await mysql.query('INSERT INTO research (user_id, id, level) VALUES (?, ?, ?)', [req.userData.id, researchID, 2])
    } else {
      await mysql.query('UPDATE research SET level=level+? WHERE user_id=? and id=?', [1, req.userData.id, researchID])
    }

    res.json({
      success: true,
    })
  })
}
