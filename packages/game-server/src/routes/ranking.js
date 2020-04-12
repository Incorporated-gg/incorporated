const mysql = require('../lib/mysql')
const users = require('../lib/db/users')
const alliances = require('../lib/db/alliances')

const entriesPerPage = 50

module.exports = app => {
  app.get('/v1/ranking', async function(req, res) {
    const pagination = [
      ((parseInt(req.query.page) - 1 > 0 && parseInt(req.query.page) - 1) || 0) * entriesPerPage,
      entriesPerPage,
    ]
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const type = req.query.type === 'alliances' ? 'alliances' : req.query.type === 'research' ? 'research' : 'income'

    let ranking = {}
    switch (type) {
      case 'income': {
        const rankingData = await mysql.query(
          'SELECT user_id, rank, points FROM ranking_income ORDER BY rank ASC LIMIT ?',
          [pagination]
        )
        ranking.listing = await Promise.all(
          rankingData.map(async rankUser => ({
            rank: rankUser.rank,
            points: rankUser.points,
            user: await users.getData(rankUser.user_id),
          }))
        )
        const [{ numEntries }] = await mysql.query('SELECT COUNT(user_id) as numEntries FROM ranking_income')
        ranking.maxPages = Math.ceil(numEntries / entriesPerPage)
        break
      }
      case 'research': {
        const rankingData = await mysql.query(
          'SELECT user_id, rank, points FROM ranking_research ORDER BY rank ASC LIMIT ?',
          [pagination]
        )
        ranking.listing = await Promise.all(
          rankingData.map(async rankUser => ({
            rank: rankUser.rank,
            points: rankUser.points,
            user: await users.getData(rankUser.user_id),
          }))
        )
        const [{ numEntries }] = await mysql.query('SELECT COUNT(user_id) as numEntries FROM ranking_research')
        ranking.maxPages = Math.ceil(numEntries / entriesPerPage)
        break
      }
      case 'alliances': {
        const rankingData = await mysql.query(
          'SELECT alliance_id, rank, points FROM ranking_alliances ORDER BY rank ASC LIMIT ?',
          [pagination]
        )
        ranking.listing = await Promise.all(
          rankingData.map(async rankAliance => ({
            rank: rankAliance.rank,
            points: rankAliance.points,
            alliance: await alliances.getBasicData(rankAliance.alliance_id),
          }))
        )
        const [{ numEntries }] = await mysql.query('SELECT COUNT(alliance_id) as numEntries FROM ranking_alliances')
        ranking.maxPages = Math.ceil(numEntries / entriesPerPage)
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

    if (!userID) {
      res.status(401).json({ error: 'Usuario no encontrado' })
      return
    }

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

    if (!allianceID) {
      res.status(401).json({ error: 'Alianza no encontrada' })
      return
    }

    const [basicData, members, activeWars, pastWars, allianceHoods] = await Promise.all([
      alliances.getBasicData(allianceID),
      alliances.getMembers(allianceID),
      alliances.getAllianceActiveWars(allianceID),
      alliances.getAlliancePastWars(allianceID),
      alliances.getAllianceHoods(allianceID),
    ])

    const alliance = Object.assign(basicData, {
      members,
      active_wars: activeWars,
      past_wars: pastWars,
      hoods: allianceHoods,
    })

    res.json({
      alliance,
    })
  })
}
