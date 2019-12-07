const mysql = require('../lib/mysql')

module.exports = app => {
  app.get('/v1/contests', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [contests] = await mysql.query(
      'SELECT id, name FROM contests WHERE started_at IS NOT NULL AND ended_at IS NULL'
    )

    res.json({
      contests,
    })
  })
}
