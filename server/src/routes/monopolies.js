const users = require('../lib/db/users')
const mysql = require('../lib/mysql')

module.exports = app => {
  app.get('/v1/monopolies', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const monopolies = []
    const [monopolyHolders] = await mysql.query('SELECT building_id, user_id, building_quantity FROM monopolies')
    await Promise.all(
      monopolyHolders.map(async monopoly => {
        return {
          building_id: monopoly.building_id,
          building_quantity: monopoly.building_quantity,
          user: await users.getData(monopoly.user_id),
        }
      })
    )

    res.json({
      monopolies,
    })
  })
}
