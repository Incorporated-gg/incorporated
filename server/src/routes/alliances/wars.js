const mysql = require('../../lib/mysql')
const alliances = require('../../lib/db/alliances')
const { sendMessage } = require('../../lib/db/users')

module.exports = app => {
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
    if (!userRank || !userRank.is_admin) {
      res.status(401).json({ error: 'No eres admin de una alianza' })
      return
    }

    const activeWarBetweenBoth = await alliances.checkWarBetweenAlliances(userRank.alliance_id, attackedAllianceID)
    if (activeWarBetweenBoth) {
      res.status(401).json({ error: 'Ya tenéis una guerra activa' })
      return
    }

    const tsNow = Math.floor(Date.now() / 1000)
    const [
      { insertId: warID },
    ] = await mysql.query('INSERT INTO alliances_wars (created_at, alliance1_id, alliance2_id) VALUES (?, ?, ?)', [
      tsNow,
      userRank.alliance_id,
      attackedAllianceID,
    ])

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

  app.post('/v1/alliance/buffs/activate', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.is_admin) {
      res.status(401).json({ error: 'No eres admin de una alianza' })
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
}
