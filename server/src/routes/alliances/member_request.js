const mysql = require('../../lib/mysql')
const alliances = require('../../lib/db/alliances')
const users = require('../../lib/db/users')

module.exports = app => {
  app.get('/v1/alliance/member_request/list', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.is_admin) {
      res.status(401).json({ error: 'No eres admin de una alianza' })
      return
    }

    const [
      memberReqRaw,
    ] = await mysql.query(
      'SELECT user_id FROM alliances_member_requests WHERE alliance_id=? ORDER BY created_at DESC',
      [userRank.alliance_id]
    )
    const memberRequests = await Promise.all(memberReqRaw.map(memberReq => users.getData(memberReq.user_id)))

    res.json({ member_requests: memberRequests })
  })

  app.post('/v1/alliance/member_request/create', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const hasAlliance = await alliances.getUserAllianceID(req.userData.id)
    if (hasAlliance) {
      res.status(401).json({ error: 'Ya eres miembro de una alianza' })
      return
    }

    const allianceID = req.body.alliance_id
    const allianceMembers = await alliances.getMembers(allianceID)
    if (allianceMembers.length === 0) {
      res.status(401).json({ error: 'Esta alianza no existe' })
      return
    }
    if (allianceMembers.length === alliances.MAX_MEMBERS) {
      res.status(401).json({ error: 'Esta alianza no puede tener más miembros' })
      return
    }

    await mysql.query('DELETE FROM alliances_member_requests WHERE user_id=?', [req.userData.id])
    await mysql.query('INSERT INTO alliances_member_requests (alliance_id, user_id, created_at) VALUES (?, ?, ?)', [
      allianceID,
      req.userData.id,
      Math.floor(Date.now() / 1000),
    ])

    res.json({ success: true })
  })

  app.post('/v1/alliance/member_request/accept', memberRequestAction('accept'))
  app.post('/v1/alliance/member_request/reject', memberRequestAction('reject'))
}

function memberRequestAction(action) {
  return async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.is_admin) {
      res.status(401).json({ error: 'No eres admin de una alianza' })
      return
    }

    const userID = req.body.user_id
    const allianceMembers = await alliances.getMembers(userRank.alliance_id)
    const [
      [requestExists],
    ] = await mysql.query('SELECT 1 FROM alliances_member_requests WHERE user_id=? AND alliance_id=?', [
      userID,
      userRank.alliance_id,
    ])
    if (!requestExists) {
      res.status(401).json({ error: 'Petición de miembro no encontrada' })
      return
    }

    if (action === 'accept') {
      if (allianceMembers.length === alliances.MAX_MEMBERS) {
        res.status(401).json({ error: 'Esta alianza no puede tener más miembros' })
        return
      }
    }

    await mysql.query('DELETE FROM alliances_member_requests WHERE user_id=?', [userID])
    if (action === 'accept') {
      await mysql.query(
        'INSERT INTO alliances_members (alliance_id, user_id, created_at, rank_name, is_admin) VALUES (?, ?, ?, ?, ?)',
        [userRank.alliance_id, userID, Math.floor(Date.now() / 1000), 'Recruta', false]
      )
    }

    res.json({ success: true })
  }
}
