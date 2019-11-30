const mysql = require('../lib/mysql')
const researchUtils = require('shared-lib/researchUtils')

module.exports = app => {
  app.get('/v1/research', async function(req, res) {
    if (!req.userData) {
      res.status(401).send({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const researchs = {}
    researchUtils.researchList.forEach(research => (researchs[research.id] = 0))

    const [researchsRaw] = await mysql.query('SELECT id, level FROM research WHERE user_id=?', [req.userData.id])
    if (researchsRaw) researchsRaw.forEach(research => (researchs[research.id] = research.level))

    res.send({
      researchs,
    })
  })

  app.post('/v1/buy_research', async function(req, res) {
    if (!req.userData) {
      res.status(401).send({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.research_id || !req.body.count) {
      res.status(400).send({ error: 'Faltan datos' })
      return
    }
    const researchID = req.body.research_id
    const count = 1 // TODO: Use req.body.count
    if (count > 1) throw new Error('Not implemented yet')

    if (!researchUtils.researchList.find(b => b.id === researchID)) {
      res.status(400).send({ error: 'Invalid research_id' })
      return
    }

    const [[research]] = await mysql.query('SELECT level FROM research WHERE user_id=? and id=?', [
      req.userData.id,
      researchID,
    ])
    const price = researchUtils.calcResearchPrice(researchID, research ? research.level : 0)
    if (price > req.userData.money) {
      res.status(400).send({ error: 'No tienes suficiente dinero' })
      return
    }

    req.userData.money -= price
    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])

    if (!research) {
      await mysql.query('INSERT INTO research (user_id, id, level) VALUES (?, ?, ?)', [
        req.userData.id,
        researchID,
        1,
      ])
    } else {
      await mysql.query('UPDATE research SET level=level+1 WHERE user_id=? and id=?', [
        req.userData.id,
        researchID,
        1,
      ])
    }


    res.send({
      success: true,
    })
  })
}
