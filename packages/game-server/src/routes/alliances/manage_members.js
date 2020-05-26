import { getUserData, sendMessage } from '../../lib/db/users'
import mysql from '../../lib/mysql'
import {
  getUserAllianceRank,
  getUserAllianceID,
  getAllianceMembers,
  getAllianceBasicData,
} from '../../lib/db/alliances'
import { MAX_ALLIANCE_MEMBERS, PERMISSIONS_LIST } from 'shared-lib/allianceUtils'
import Conversation from '../../chat/Conversation'
import { chatEvents } from '../../chat'

module.exports = app => {
  app.get('/v1/alliance/member_request/list', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_accept_and_kick_members) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const memberReqRaw = await mysql.query(
      'SELECT user_id FROM alliances_member_requests WHERE alliance_id=? ORDER BY created_at DESC',
      [userRank.alliance_id]
    )
    const memberRequests = await Promise.all(memberReqRaw.map(memberReq => getUserData(memberReq.user_id)))

    res.json({ member_requests: memberRequests })
  })

  app.post('/v1/alliance/member_request/create', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const hasAlliance = await getUserAllianceID(req.userData.id)
    if (hasAlliance) {
      res.status(401).json({ error: 'Ya eres miembro de una alianza' })
      return
    }

    const allianceID = req.body.alliance_id
    const allianceMembers = await getAllianceMembers(allianceID)
    if (allianceMembers.length === 0) {
      res.status(401).json({ error: 'Esta alianza no existe' })
      return
    }
    if (allianceMembers.length >= MAX_ALLIANCE_MEMBERS) {
      res.status(401).json({ error: 'Esta alianza no puede tener más miembros' })
      return
    }
    const alreadySent = await mysql.selectOne(
      'SELECT 1 FROM alliances_member_requests WHERE user_id=? AND alliance_id=?',
      [req.userData.id, allianceID]
    )
    if (alreadySent) {
      res.status(401).json({ error: 'Ya has mandado una petición a esta alianza' })
      return
    }

    // Send message to those who can accept it
    const usersWhoCanAcceptRequests = await mysql.query(
      'SELECT user_id FROM alliances_members WHERE alliance_id=? AND permission_accept_and_kick_members=1',
      [allianceID]
    )

    await Promise.all(
      usersWhoCanAcceptRequests.map(member => {
        sendMessage({
          receiverID: member.user_id,
          senderID: null,
          type: 'new_alli_member_req',
          data: { sender_id: req.userData.id },
        })
      })
    )

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
    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_accept_and_kick_members) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const userBeingKickedID = parseInt(req.body.user_id)
    const memberBeingKicked = await getUserAllianceRank(userBeingKickedID)
    if (!memberBeingKicked || memberBeingKicked.alliance_id !== userRank.alliance_id) {
      res.status(401).json({ error: 'Miembro no encontrado' })
      return
    }

    if (memberBeingKicked.permission_admin) {
      res.status(401).json({ error: 'No puedes echar a un líder, quítale primero el permiso de líder' })
      return
    }

    await mysql.query('DELETE FROM alliances_members WHERE user_id=?', [userBeingKickedID])

    // Sync alliance chat users
    const allianceMembers = await getAllianceMembers(memberBeingKicked.alliance_id)
    const allianceUserIDs = allianceMembers.map(u => u.user.id)
    const roomName = `alliance${memberBeingKicked.alliance_id}`
    const allianceConversation = new Conversation({
      id: roomName,
      type: 'alliance',
      userIds: allianceUserIDs,
    })
    await allianceConversation.init()
    await allianceConversation.syncUsers()
    chatEvents.emit('kickUser', { room: roomName, userId: userBeingKickedID })

    res.json({ success: true })
  })

  app.post('/v1/alliance/edit_rank', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_admin) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const newRankName = req.body.rank_name
    const permissions = {}
    PERMISSIONS_LIST.forEach(permissionName => {
      permissions[permissionName] = Boolean(req.body[permissionName])
    })

    const isValidRankName = typeof newRankName === 'string' && newRankName.length >= 1 && newRankName.length <= 20
    if (!isValidRankName) {
      res.status(400).json({ error: 'Nombre de rango inválido' })
      return
    }

    const allianceMembers = await getAllianceMembers(userRank.alliance_id)

    const switchingUser = allianceMembers.find(member => member.user.username === req.body.username)
    if (!switchingUser) {
      res.status(401).json({ error: 'Nombre de usuario no encontrado' })
      return
    }
    const switchingUserRank = await getUserAllianceRank(switchingUser.user.id)

    if (!permissions.permission_admin) {
      const adminsCount = allianceMembers.reduce((prev, curr) => prev + (curr.permission_admin ? 1 : 0), 0)
      if (adminsCount <= 1 && switchingUserRank.permission_admin) {
        res.status(401).json({ error: 'No puedes quitarle liderazgo al último líder' })
        return
      }
    }

    await mysql.query(
      'UPDATE alliances_members SET rank_name=?, \
      permission_admin=?, permission_accept_and_kick_members=?, permission_extract_resources=?, \
      permission_activate_buffs=? \
      WHERE alliance_id=? AND user_id=?',
      [
        newRankName,
        permissions.permission_admin,
        permissions.permission_accept_and_kick_members,
        permissions.permission_extract_resources,
        permissions.permission_activate_buffs,
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

    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_accept_and_kick_members) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const userID = req.body.user_id
    const allianceMembers = await getAllianceMembers(userRank.alliance_id)
    const requestExists = await mysql.selectOne(
      'SELECT 1 FROM alliances_member_requests WHERE user_id=? AND alliance_id=?',
      [userID, userRank.alliance_id]
    )
    if (!requestExists) {
      res.status(401).json({ error: 'Petición de miembro no encontrada' })
      return
    }

    if (action === 'reject') {
      await mysql.query('DELETE FROM alliances_member_requests WHERE user_id=? AND alliance_id=?', [
        userID,
        userRank.alliance_id,
      ])
    } else if (action === 'accept') {
      if (allianceMembers.length >= MAX_ALLIANCE_MEMBERS) {
        res.status(401).json({ error: 'Esta alianza no puede tener más miembros' })
        return
      }

      await mysql.query('DELETE FROM alliances_member_requests WHERE user_id=?', [userID])
      await mysql.query(
        'INSERT INTO alliances_members (alliance_id, user_id, created_at, rank_name, permission_admin) VALUES (?, ?, ?, ?, ?)',
        [userRank.alliance_id, userID, Math.floor(Date.now() / 1000), 'Recluta', false]
      )

      // Sync alliance chat users
      const allianceUserIDs = allianceMembers.map(u => u.user.id)
      const allianceData = await getAllianceBasicData(userRank.alliance_id)
      const roomName = `alliance${allianceData.id}`
      const allianceConversation = new Conversation({
        id: roomName,
        type: 'alliance',
        userIds: allianceUserIDs,
        name: `${allianceData.long_name} [${allianceData.short_name}]`,
      })
      await allianceConversation.init()
      await allianceConversation.syncUsers()
      chatEvents.emit('addUser', { room: roomName, userId: userID })
    }

    res.json({ success: true })
  }
}
