const mysql = require('../lib/mysql')
const users = require('../lib/db/users')
const alliances = require('../lib/db/alliances')

module.exports = app => {
  app.get('/v1/ranking', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [rankingData] = await mysql.query('SELECT user_id FROM ranking ORDER BY ranking.rank ASC')
    const ranking = await Promise.all(rankingData.map(rankUser => users.getData(rankUser.user_id)))

    res.json({
      ranking,
    })
  })
  app.get('/v1/ranking/user', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userID = await users.getIDFromUsername(req.query.username)
    const userData = await users.getData(userID)

    res.json({
      user: userData,
    })
  })
  app.get('/v1/ranking/alliance', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const basicData = await alliances.getBasicData(req.query.alliance_id)
    const privateData = await alliances.getPrivateData(basicData.id)

    const alliance = Object.assign(basicData, {
      members: privateData.members,
    })

    res.json({
      alliance,
    })
  })
}
