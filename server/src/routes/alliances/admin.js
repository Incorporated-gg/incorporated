const mysql = require('../../lib/mysql')
const alliances = require('../../lib/db/alliances')
const { CREATE_ALLIANCE_PRICE } = require('shared-lib/allianceUtils')

const alphanumericRegexp = /^[a-z0-9]+$/i

module.exports = app => {
  app.post('/v1/alliance/create', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.short_name || !req.body.long_name || !req.body.description) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const longName = req.body.long_name
    const shortName = req.body.short_name
    const description = req.body.description
    const allianceCreatedAt = Math.floor(Date.now() / 1000)

    const isValidLongName =
      typeof longName === 'string' &&
      longName.length >= 2 &&
      longName.length <= 20 &&
      alphanumericRegexp.test(longName.replace(/ /g, '')) // Test for alphanumeric but allow spaces
    if (!isValidLongName) {
      res.status(400).json({ error: 'Nombre inválido' })
      return
    }

    const isValidShortName =
      typeof shortName === 'string' &&
      shortName.length >= 2 &&
      shortName.length <= 5 &&
      alphanumericRegexp.test(shortName)
    if (!isValidShortName) {
      res.status(400).json({ error: 'Iniciales inválidas' })
      return
    }

    const isValidDescription = typeof description === 'string' && description.length >= 0 && description.length <= 1000
    if (!isValidDescription) {
      res.status(400).json({ error: 'Descripción inválida' })
      return
    }

    const hasAlliance = await alliances.getUserAllianceID(req.userData.id)
    if (hasAlliance) {
      res.status(401).json({ error: 'Ya tienes una alianza' })
      return
    }

    if (req.userData.money < CREATE_ALLIANCE_PRICE) {
      res.status(401).json({ error: 'No tienes suficiente dinero' })
      return
    }
    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [CREATE_ALLIANCE_PRICE, req.userData.id])

    // Create alliance
    const [
      { insertId: newAllianceID },
    ] = await mysql.query(
      'INSERT INTO alliances (created_at, picture_url, long_name, short_name, description) VALUES (?, ?, ?, ?, ?)',
      [allianceCreatedAt, null, longName, shortName, description]
    )
    await mysql.query(
      'INSERT INTO alliances_members (created_at, alliance_id, user_id, rank_name, is_admin) VALUES (?, ?, ?, ?, ?)',
      [allianceCreatedAt, newAllianceID, req.userData.id, 'Admin', true]
    )

    res.json({ success: true, new_alliance_id: newAllianceID })
  })

  app.post('/v1/alliance/delete', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.is_admin) {
      res.status(401).json({ error: 'No eres admin de una alianza' })
      return
    }

    await Promise.all([
      mysql.query('DELETE FROM alliances WHERE id=?', [userRank.alliance_id]),
      mysql.query('DELETE FROM alliances_members WHERE alliance_id=?', [userRank.alliance_id]),
      mysql.query('DELETE FROM alliances_research WHERE alliance_id=?', [userRank.alliance_id]),
      mysql.query('DELETE FROM alliances_member_requests WHERE alliance_id=?', [userRank.alliance_id]),
    ])

    res.json({ success: true })
  })

  app.post('/v1/alliance/edit_rank', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const newRankName = req.body.rank_name
    const newIsLeader = Boolean(req.body.is_admin)

    const isValidRankName = typeof newRankName === 'string' && newRankName.length >= 1 && newRankName.length <= 20
    if (!isValidRankName) {
      res.status(400).json({ error: 'Nombre de rango inválido' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.is_admin) {
      res.status(401).json({ error: 'No eres admin de una alianza' })
      return
    }
    const allianceMembers = await alliances.getMembers(userRank.alliance_id)

    const switchingUser = allianceMembers.find(member => member.user.username === req.body.username)
    if (!switchingUser) {
      res.status(401).json({ error: 'Nombre de usuario no encontrado' })
      return
    }

    if (!newIsLeader) {
      const adminsCount = allianceMembers.reduce((prev, curr) => prev + (curr.is_admin ? 1 : 0), 0)
      if (adminsCount <= 1) {
        res.status(401).json({ error: 'No puedes quitarle liderazgo al último líder' })
        return
      }
    }

    await mysql.query('UPDATE alliances_members SET is_admin=?, rank_name=? WHERE alliance_id=? AND user_id=?', [
      newIsLeader,
      newRankName,
      userRank.alliance_id,
      switchingUser.user.id,
    ])

    res.json({ success: true })
  })
}
