const mysql = require('../../lib/mysql')
const alliances = require('../../lib/db/alliances')
const users = require('../../lib/db/users')
const { MAX_ALLIANCE_MEMBERS } = require('shared-lib/allianceUtils')

module.exports = app => {
  app.get('/v1/alliance/member_request/list', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.permission_accept_and_kick_members) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const memberReqRaw = await mysql.query(
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
    if (allianceMembers.length >= MAX_ALLIANCE_MEMBERS) {
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

  app.post('/v1/alliance/kick_member', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.permission_accept_and_kick_members) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const userBeingKickedID = parseInt(req.body.user_id)
    const memberBeingKicked = await alliances.getUserRank(userBeingKickedID)
    if (!memberBeingKicked || memberBeingKicked.alliance_id !== userRank.alliance_id) {
      res.status(401).json({ error: 'Miembro no encontrado' })
      return
    }

    if (memberBeingKicked.permission_admin) {
      res.status(401).json({ error: 'No puedes echar a un líder, quítale primero el permiso de líder' })
      return
    }

    await mysql.query('DELETE FROM alliances_members WHERE user_id=?', [userBeingKickedID])

    res.json({ success: true })
  })

  app.post('/v1/alliance/edit_rank', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await alliances.getUserRank(req.userData.id)
    if (!userRank || !userRank.permission_admin) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const newRankName = req.body.rank_name
    const permissionsList = [
      'permission_admin',
      'permission_accept_and_kick_members',
      'permission_extract_money',
      'permission_extract_troops',
      'permission_send_circular_msg',
      'permission_activate_buffs',
      'permission_declare_war',
    ]
    const permissions = {}
    permissionsList.forEach(permissionName => {
      permissions[permissionName] = Boolean(req.body[permissionName])
    })

    const isValidRankName = typeof newRankName === 'string' && newRankName.length >= 1 && newRankName.length <= 20
    if (!isValidRankName) {
      res.status(400).json({ error: 'Nombre de rango inválido' })
      return
    }

    const allianceMembers = await alliances.getMembers(userRank.alliance_id)

    const switchingUser = allianceMembers.find(member => member.user.username === req.body.username)
    if (!switchingUser) {
      res.status(401).json({ error: 'Nombre de usuario no encontrado' })
      return
    }
    const switchingUserRank = await alliances.getUserRank(switchingUser.user.id)

    if (!permissions.permission_admin) {
      const adminsCount = allianceMembers.reduce((prev, curr) => prev + (curr.permission_admin ? 1 : 0), 0)
      if (adminsCount <= 1 && switchingUserRank.permission_admin) {
        res.status(401).json({ error: 'No puedes quitarle liderazgo al último líder' })
        return
      }
    }

    await mysql.query(
      'UPDATE alliances_members SET rank_name=?, \
      permission_admin=?, permission_accept_and_kick_members=?, permission_extract_money=?, permission_extract_troops=?, \
      permission_send_circular_msg=?, permission_activate_buffs=?, permission_declare_war=? \
      WHERE alliance_id=? AND user_id=?',
      [
        newRankName,
        permissions.permission_admin,
        permissions.permission_accept_and_kick_members,
        permissions.permission_extract_money,
        permissions.permission_extract_troops,
        permissions.permission_send_circular_msg,
        permissions.permission_activate_buffs,
        permissions.permission_declare_war,
        userRank.alliance_id,
        switchingUser.user.id,
      ]
    )

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
    if (!userRank || !userRank.permission_accept_and_kick_members) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const userID = req.body.user_id
    const allianceMembers = await alliances.getMembers(userRank.alliance_id)
    const [
      requestExists,
    ] = await mysql.query('SELECT 1 FROM alliances_member_requests WHERE user_id=? AND alliance_id=?', [
      userID,
      userRank.alliance_id,
    ])
    if (!requestExists) {
      res.status(401).json({ error: 'Petición de miembro no encontrada' })
      return
    }

    if (action === 'accept') {
      if (allianceMembers.length >= MAX_ALLIANCE_MEMBERS) {
        res.status(401).json({ error: 'Esta alianza no puede tener más miembros' })
        return
      }
    }

    await mysql.query('DELETE FROM alliances_member_requests WHERE user_id=?', [userID])
    if (action === 'accept') {
      await mysql.query(
        'INSERT INTO alliances_members (alliance_id, user_id, created_at, rank_name, permission_admin) VALUES (?, ?, ?, ?, ?)',
        [userRank.alliance_id, userID, Math.floor(Date.now() / 1000), 'Recluta', false]
      )
    }

    res.json({ success: true })
  }
}
