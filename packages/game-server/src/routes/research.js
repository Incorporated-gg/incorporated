const mysql = require('../lib/mysql')
const { researchList, calcResearchPrice } = require('shared-lib/researchUtils')

module.exports = app => {
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

    const price = calcResearchPrice(researchID, req.userData.researchs[researchID])
    if (price > req.userData.money) {
      res.status(400).json({ error: 'No tienes suficiente dinero' })
      return
    }

    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])
    req.userData.money -= price

    const researchRowExists = req.userData.researchs[researchID] !== 1
    if (!researchRowExists) {
      await mysql.query('INSERT INTO research (user_id, id, level) VALUES (?, ?, ?)', [req.userData.id, researchID, 2])
    } else {
      await mysql.query('UPDATE research SET level=level+? WHERE user_id=? and id=?', [1, req.userData.id, researchID])
    }
    req.userData.researchs[researchID] += 1

    res.json({
      success: true,
    })
  })
}