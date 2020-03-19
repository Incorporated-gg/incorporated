import { hoods } from '../lib/map'

module.exports = app => {
  app.get('/v1/map', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    res.json({
      hoods,
    })
  })
}
