const mysql = require('./lib/mysql')
const {
  getResearchs,
  getPersonnel,
  getUnreadMessagesCount,
  getBuildings,
  runUserMoneyUpdate,
} = require('./lib/db/users')

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
      ;[req.userData] = await mysql.query('SELECT id, username, money FROM users WHERE id=?', [sessionData.user_id])

      await runUserMoneyUpdate(req.userData.id)

      const [researchs, personnel, buildings] = await Promise.all([
        getResearchs(req.userData.id),
        getPersonnel(req.userData.id),
        getBuildings(req.userData.id),
      ])

      req.userData.researchs = researchs
      req.userData.personnel = personnel
      req.userData.buildings = buildings
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
      const extraData = {
        money: req.userData.money,
        unread_messages_count: await getUnreadMessagesCount(req.userData.id),
        personnel: req.userData.personnel,
        researchs: req.userData.researchs,
        buildings: req.userData.buildings,
      }
      arguments[0]._extra = extraData
    }
    oldJson.apply(res, arguments)
  }
  next()
}
