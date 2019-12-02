const users = require('../lib/db/users')

module.exports = app => {
  app.get('/v1/my_data', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userData = await users.getData(req.userData.id)

    res.json({
      user_data: {
        id: req.userData.id,
        username: req.userData.username,
        email: req.userData.email,
        money: req.userData.money,
        income_per_second: req.userData.income_per_second,
        researchs: req.userData.researchs,
        personnel: req.userData.personnel,
        has_alliance: Boolean(userData.alliance),
      },
    })
  })
}
