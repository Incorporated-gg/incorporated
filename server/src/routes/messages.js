const mysql = require('../lib/mysql')
const users = require('../lib/db/users')
const alliances = require('../lib/db/alliances')
const missions = require('../lib/db/missions')

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

    const [
      messagesRaw,
    ] = await mysql.query(
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

    const receiverID = await users.getIDFromUsername(req.body.to_username)
    if (!receiverID) {
      res.status(400).json({ error: 'Nombre de usuario inválido' })
      return
    }
    const message = req.body.message
    const isValidMessage = typeof message === 'string' && message.length >= 1 && message.length <= 500
    if (!isValidMessage) {
      res.status(400).json({ error: 'Mensaje inválido' })
      return
    }

    const encodedData = JSON.stringify({
      message,
    })

    const createdAt = Math.floor(Date.now() / 1000)
    await mysql.query('INSERT INTO messages (user_id, sender_id, created_at, type, data) VALUES (?, ?, ?, ?, ?)', [
      receiverID,
      req.userData.id,
      createdAt,
      'private_message',
      encodedData,
    ])

    res.json({
      success: true,
    })
  })
}

async function parseMessage(msg) {
  const data = JSON.parse(msg.data)
  const result = {
    id: msg.id,
    created_at: msg.created_at,
    type: msg.type,
    receiver: await users.getData(msg.user_id),
    sender: await users.getData(msg.sender_id),
    data,
  }
  try {
    switch (msg.type) {
      case 'spy_report':
      case 'attack_report': {
        const [[missionRaw]] = await mysql.query('SELECT * FROM missions WHERE id=?', [result.data.mission_id])
        const mission = await missions.parseMissionFromDB(missionRaw)
        delete result.data.mission_id
        result.data.mission = mission
        break
      }
      case 'caught_spies': {
        result.data.attacker = await users.getData(result.data.attacker_id)
        delete result.data.attacker_id
        break
      }
      case 'war_started':
      case 'war_ended': {
        const [[war]] = await mysql.query('SELECT alliance1_id, alliance2_id, data FROM alliances_wars WHERE id=?', [
          result.data.war_id,
        ])
        result.data.attacker_alliance = await alliances.getBasicData(war.alliance1_id)
        result.data.defender_alliance = await alliances.getBasicData(war.alliance2_id)
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
