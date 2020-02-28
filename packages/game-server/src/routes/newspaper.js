import getNewspaper from '../lib/newspaper/get_newspaper'

module.exports = app => {
  app.get('/v1/newspaper', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const dayID = req.query.dayID
    if (dayID === undefined) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const newspaper = await getNewspaper(dayID)

    res.json({
      newspaper,
    })
  })
}
