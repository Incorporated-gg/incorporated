const mysql = require('../lib/mysql')
const users = require('../lib/db/users')

module.exports = app => {
  app.get('/v1/messages', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const type = req.query.type === 'sent' ? 'sent' : 'received'
    const perPage = 500
    const page = 0

    const [
      messagesRaw,
    ] = await mysql.query(
      'SELECT id, user_id, sender_id, created_at, type, data FROM messages WHERE ??=? ORDER BY created_at DESC LIMIT ?,?',
      [type === 'sent' ? 'sender_id' : 'user_id', req.userData.id, page * perPage, perPage]
    )

    const messages = await Promise.all(
      messagesRaw.map(async msg => {
        const data = JSON.parse(msg.data)
        const result = {
          id: msg.id,
          created_at: msg.created_at,
          type: msg.type,
          data,
        }
        result.receiver = await users.getData(msg.user_id)
        result.sender = await users.getData(msg.sender_id)
        if (msg.type === 'attack_report') {
          result.data.attacker = await users.getData(result.data.attacker_id)
          result.data.defender = await users.getData(result.data.defender_id)
          delete result.data.attacker_id
          delete result.data.defender_id
        }
        return result
      })
    )

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
