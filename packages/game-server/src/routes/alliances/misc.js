import { hoods } from '../../lib/map'
const mysql = require('../../lib/mysql')
const alliances = require('../../lib/db/alliances')
const { sendMessage } = require('../../lib/db/users')
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

    const isValidDescription = checkIsDescriptionValid(description)
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
    const {
      insertId: newAllianceID,
    } = await mysql.query(
      'INSERT INTO alliances (created_at, picture_url, long_name, short_name, description) VALUES (?, ?, ?, ?, ?)',
      [allianceCreatedAt, null, longName, shortName, description]
    )
    await mysql.query(
      'INSERT INTO alliances_members (created_at, alliance_id, user_id, rank_name, permission_admin) VALUES (?, ?, ?, ?, ?)',
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
    if (!userRank || !userRank.permission_admin) {
      res.status(401).json({ error: 'No eres admin de una alianza' })
      return
    }

    await alliances.deleteAlliance(userRank.alliance_id)

    res.json({ success: true })
  })

  app.post('/v1/alliance/leave', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank) {
      res.status(401).json({ error: 'No eres miembro de una alianza' })
      return
    }
    if (userRank.permission_admin) {
      res.status(401).json({ error: 'No puedes salir de una alianza siendo admin' })
      return
    }

    await mysql.query('DELETE FROM alliances_members WHERE alliance_id=? AND user_id=?', [
      userRank.alliance_id,
      req.userData.id,
    ])

    res.json({ success: true })
  })

  app.post('/v1/alliance/buffs/activate', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.permission_activate_buffs) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    if (!req.body.buff_id) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const buffID = req.body.buff_id

    const buffsData = await alliances.getBuffsData(userRank.alliance_id)
    const buff = buffsData[buffID]

    if (!buff) {
      res.status(401).json({ error: 'Este buff no existe' })
      return
    }
    if (buff.active) {
      res.status(401).json({ error: 'Este buff ya está activo' })
      return
    }
    if (!buff.can_activate) {
      res.status(401).json({ error: 'Aún no puedes activar este buff' })
      return
    }

    const msNow = Math.floor(Date.now() / 1000)
    await mysql.query('UPDATE alliances SET ??=? WHERE id=?', [`buff_${buffID}_last_used`, msNow, userRank.alliance_id])

    res.json({ success: true })
  })

  app.post('/v1/alliance/declare_war', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const attackedAllianceID = req.body.alliance_id
    const allianceExists = await alliances.getBasicData(attackedAllianceID)
    if (!allianceExists) {
      res.status(401).json({ error: 'Esa alianza no existe' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.permission_declare_war) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const activeWarBetweenBoth = await alliances.getActiveWarBetweenAlliances(userRank.alliance_id, attackedAllianceID)
    if (activeWarBetweenBoth) {
      res.status(401).json({ error: 'Ya tenéis una guerra activa' })
      return
    }

    const attackedHoods = req.body.hoods
    const areHoodsValid =
      Array.isArray(attackedHoods) &&
      attackedHoods.length > 0 &&
      attackedHoods.every(hoodID => {
        const hood = hoods.find(_h => _h.id === hoodID)
        return hood && hood.owner && hood.owner.id === attackedAllianceID
      })
    if (!areHoodsValid) {
      res.status(401).json({ error: 'Barrios inválidos' })
      return
    }

    const data = { hoods: attackedHoods, days: {} }
    const tsNow = Math.floor(Date.now() / 1000)
    const {
      insertId: warID,
    } = await mysql.query(
      'INSERT INTO alliances_wars (created_at, alliance1_id, alliance2_id, data) VALUES (?, ?, ?, ?)',
      [tsNow, userRank.alliance_id, attackedAllianceID, JSON.stringify(data)]
    )

    const attackedAllianceMembers = await alliances.getMembers(attackedAllianceID)
    const myAllianceMembers = await alliances.getMembers(userRank.alliance_id)

    await Promise.all(
      [...attackedAllianceMembers, ...myAllianceMembers].map(member =>
        sendMessage({
          receiverID: member.user.id,
          senderID: null,
          type: 'war_started',
          data: { war_id: warID },
        })
      )
    )

    res.json({ success: true })
  })

  app.post('/v1/alliance/change_badge', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.permission_admin) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    if (!req.body.badge) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const badge = req.body.badge
    // TODO: Sanitize input. Make sure badge is correct
    await mysql.query('UPDATE alliances SET badge_json=? WHERE id=?', [JSON.stringify(badge), userRank.alliance_id])

    res.json({ success: true })
  })

  app.post('/v1/alliance/change_description', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.permission_admin) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    if (!req.body.description) req.body.description = ''

    const description = req.body.description

    const isValidDescription = checkIsDescriptionValid(description)
    if (!isValidDescription) {
      res.status(400).json({ error: 'Descripción inválida' })
      return
    }

    await mysql.query('UPDATE alliances SET description=? WHERE id=?', [description, userRank.alliance_id])

    res.json({ success: true })
  })
}

function checkIsDescriptionValid(description) {
  return typeof description === 'string' && description.length >= 0 && description.length <= 1000
}
