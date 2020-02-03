const mysql = require('./lib/mysql')

module.exports = app => {
  app.use(authMiddleware)
  app.use(modifyResponseBody)
}

async function authMiddleware(req, res, next) {
  req.userData = null

  if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
    const sessionID = req.headers.authorization.replace('Basic ', '')
    const [sessionData] = await mysql.query('SELECT user_id FROM sessions WHERE id=?', [sessionID])
    if (sessionData) {
      ;[req.userData] = await mysql.query('SELECT id, username FROM users WHERE id=?', [sessionData.user_id])
    }
    if (!req.userData) {
      res.status(400).json({ error: 'Sesión caducada', error_code: 'invalid_session_id' })
      return
    }
  }

  next()
}

function modifyResponseBody(req, res, next) {
  var oldJson = res.json

  res.json = async function() {
    if (req.userData) {
      // Modify response to include extra data for logged in users
      const extraData = {}
      arguments[0]._extra = extraData
    }
    oldJson.apply(res, arguments)
  }
  next()
}
