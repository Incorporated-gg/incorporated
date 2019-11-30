module.exports = app => {
  app.get('/v1/my_data', async function(req, res) {
    if (!req.userData) {
      res.status(401).send({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    res.send({
      user_data: {
        id: req.userData.id,
        username: req.userData.username,
        email: req.userData.email,
        money: req.userData.money,
        income_per_second: req.userData.income_per_second,
      },
    })
  })
}
