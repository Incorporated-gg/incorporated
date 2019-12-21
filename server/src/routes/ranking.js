const mysql = require('../lib/mysql')
const users = require('../lib/db/users')
const alliances = require('../lib/db/alliances')

module.exports = app => {
  app.get('/v1/ranking', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const type = req.query.type === 'alliances' ? 'alliances' : req.query.type === 'research' ? 'research' : 'income'

    let ranking = []
    switch (type) {
      case 'income': {
        const [rankingData] = await mysql.query('SELECT user_id, rank, points FROM ranking_income ORDER BY rank ASC')
        ranking = await Promise.all(
          rankingData.map(async rankUser => ({
            rank: rankUser.rank,
            points: rankUser.points,
            user: await users.getData(rankUser.user_id),
          }))
        )
        break
      }
      case 'research': {
        const [rankingData] = await mysql.query('SELECT user_id, rank, points FROM ranking_research ORDER BY rank ASC')
        ranking = await Promise.all(
          rankingData.map(async rankUser => ({
            rank: rankUser.rank,
            points: rankUser.points,
            user: await users.getData(rankUser.user_id),
          }))
        )
        break
      }
      case 'alliances': {
        const [rankingData] = await mysql.query(
          'SELECT alliance_id, rank, points FROM ranking_alliances ORDER BY rank ASC'
        )
        ranking = await Promise.all(
          rankingData.map(async rankAliance => ({
            rank: rankAliance.rank,
            points: rankAliance.points,
            alliance: await alliances.getBasicData(rankAliance.alliance_id),
          }))
        )
        break
      }
    }

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
  app.get('/v1/ranking/alliance/:allianceShortName', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const allianceID = await alliances.getIDFromShortName(req.params.allianceShortName)
    const basicData = await alliances.getBasicData(allianceID)
    const privateData = await alliances.getPrivateData(basicData.id)

    const alliance = Object.assign(basicData, {
      members: privateData.members,
    })

    res.json({
      alliance,
    })
  })
}
