const users = require('../lib/db/users')
const alliances = require('../lib/db/alliances')
const mysql = require('../lib/mysql')

module.exports = app => {
  app.get('/v1/my_data', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const extraInfoPromise = mysql.query('SELECT email FROM users WHERE id=?', [req.userData.id])

    const [userData, [[extraInfo]], userRank] = await Promise.all([
      users.getData(req.userData.id),
      extraInfoPromise,
      alliances.getUserRank(req.userData.id),
    ])

    res.json({
      user_data: {
        id: userData.id,
        username: userData.username,
        email: extraInfo.email,
        alliance: userData.alliance,
        alliance_user_rank: userRank,
      },
    })
  })
}
