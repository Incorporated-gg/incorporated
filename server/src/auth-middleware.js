const mysql = require('./lib/mysql')
const { getUserDailyIncome, getResearchs, getPersonnel, getUnreadMessagesCount } = require('./lib/db/users')
const { calcUserMaxMoney } = require('shared-lib/researchUtils')

module.exports = app => {
  app.use(authMiddleware)
  app.use(modifyResponseBody)
}

async function authMiddleware(req, res, next) {
  req.userData = null

  if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
    const sessionID = req.headers.authorization.replace('Basic ', '')
    const [[sessionData]] = await mysql.query('SELECT user_id FROM sessions WHERE id=?', [sessionID])
    if (sessionData) {
      ;[
        [req.userData],
      ] = await mysql.query('SELECT id, username, email, money, last_money_update FROM users WHERE id=?', [
        sessionData.user_id,
      ])

      req.userData.income_per_second = (await getUserDailyIncome(req.userData.id)) / 60 / 60 / 24
      req.userData.researchs = await getResearchs(req.userData.id)
      req.userData.personnel = await getPersonnel(req.userData.id)

      await updateMoney(req)
    }
    if (!req.userData) {
      res.status(400).json({ error: 'Sesión caducada', error_code: 'invalid_session_id' })
      return
    }
  }

  next()
}

async function updateMoney(req) {
  const tsNow = Math.floor(Date.now() / 1000)
  const moneyUpdateElapsedS = tsNow - req.userData.last_money_update
  if (moneyUpdateElapsedS <= 0.5) return

  const maxMoney = calcUserMaxMoney(req.userData.researchs)
  if (req.userData.money >= maxMoney) return

  const income = req.userData.income_per_second * moneyUpdateElapsedS
  const moneyAboveMax = Math.max(0, req.userData.money + income - maxMoney)
  const moneyAdded = income - moneyAboveMax
  await mysql.query('UPDATE users SET money=money+?, last_money_update=? WHERE id=?', [
    moneyAdded,
    tsNow,
    req.userData.id,
  ])
  req.userData.money += moneyAdded
  req.userData.money = Math.floor(req.userData.money)
}

function modifyResponseBody(req, res, next) {
  var oldJson = res.json

  res.json = async function() {
    if (req.userData) {
      // Modify response to include extra data for logged in users
      const extraData = {
        money: req.userData.money,
        income_per_second: req.userData.income_per_second,
        unread_messages_count: await getUnreadMessagesCount(req.userData.id),
      }
      arguments[0]._extra = extraData
    }
    oldJson.apply(res, arguments)
  }
  next()
}
