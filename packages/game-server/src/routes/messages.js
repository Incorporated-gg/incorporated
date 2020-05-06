import mysql from '../lib/mysql'
import { getAllianceIDFromShortName, getAllianceMembers, getAllianceBasicData } from '../lib/db/alliances'
import { getUserIDFromUsername, getUserData } from '../lib/db/users'

module.exports = app => {
  app.get('/v1/messages', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const type = req.query.type === 'sent' ? 'sent' : 'received'
    const perPage = 500
    const page = 0

    mysql.query('UPDATE users SET last_checked_messages_at=? WHERE id=?', [
      Math.floor(Date.now() / 1000),
      req.userData.id,
    ])

    const messagesRaw = await mysql.query(
      'SELECT id, user_id, sender_id, created_at, type, data FROM messages WHERE ??=? ORDER BY created_at DESC LIMIT ?,?',
      [type === 'sent' ? 'sender_id' : 'user_id', req.userData.id, page * perPage, perPage]
    )

    const messages = await Promise.all(messagesRaw.map(parseMessage))

    res.json({
      messages,
    })
  })

  app.post('/v1/messages/delete', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const messageID = parseInt(req.body.message_id)
    await mysql.query('DELETE FROM messages WHERE user_id=? AND id=?', [req.userData.id, messageID])

    res.json({
      success: true,
    })
  })

  app.post('/v1/messages/new', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    let receiversIDs
    const allianceMessage = req.body.addressee.match(/(?:^alliance:)(.*)/)

    if (allianceMessage) {
      const allianceName = allianceMessage[1]
      const allianceID = await getAllianceIDFromShortName(allianceName)

      if (!allianceID) {
        res.status(400).json({ error: 'No se ha encontrado la alianza' })
        return
      }

      const members = await getAllianceMembers(allianceID)

      if (!members.find(m => m.user.id === req.userData.id)) {
        res.status(400).json({ error: 'No perteneces a esta alianza' })
        return
      }

      receiversIDs = members.map(member => member.user.id).filter(m => !!m)
    } else {
      receiversIDs = [await getUserIDFromUsername(req.body.addressee)].filter(m => !!m)
    }

    if (!receiversIDs.length) {
      res.status(400).json({ error: 'Nombre de usuario inválido' })
      return
    }
    const message = req.body.message
    const isValidMessage = typeof message === 'string' && message.length >= 1 && message.length <= 500
    if (!isValidMessage) {
      res.status(400).json({ error: 'Mensaje inválido' })
      return
    }

    await sendMessage(message, receiversIDs, req.userData.id)

    res.json({
      success: true,
    })
  })
}

async function sendMessage(message, receiversIDs, fromID) {
  const encodedData = JSON.stringify({
    message,
  })

  const createdAt = Math.floor(Date.now() / 1000)

  await receiversIDs.forEach(async receiverID => {
    await mysql.query('INSERT INTO messages (user_id, sender_id, created_at, type, data) VALUES (?, ?, ?, ?, ?)', [
      receiverID,
      fromID,
      createdAt,
      'private_message',
      encodedData,
    ])
  })
}

async function parseMessage(msg) {
  const data = JSON.parse(msg.data)
  const result = {
    id: msg.id,
    created_at: msg.created_at,
    type: msg.type,
    receiver: await getUserData(msg.user_id),
    sender: await getUserData(msg.sender_id),
    data,
  }
  try {
    switch (msg.type) {
      case 'loan_started':
      case 'loan_ended': {
        result.data.borrower = await getUserData(result.data.borrower_id)
        result.data.lender = await getUserData(result.data.lender_id)
        delete result.data.borrower_id
        delete result.data.lender_id
        break
      }
      case 'attack_cancelled': {
        result.data.target_user = await getUserData(result.data.target_user_id)
        break
      }
      case 'new_alli_member_req': {
        result.data.sender_user = await getUserData(result.data.sender_id)
        break
      }
      case 'war_started':
      case 'war_ended': {
        const war = await mysql.selectOne('SELECT alliance1_id, alliance2_id, data FROM alliances_wars WHERE id=?', [
          result.data.war_id,
        ])
        result.data.attacker_alliance = await getAllianceBasicData(war.alliance1_id)
        result.data.defender_alliance = await getAllianceBasicData(war.alliance2_id)
        if (msg.type === 'war_ended') result.data.winner = JSON.parse(war.data).winner
        delete result.data.war_id
        break
      }
    }
  } catch (e) {
    console.error(e)
  }

  return result
}
