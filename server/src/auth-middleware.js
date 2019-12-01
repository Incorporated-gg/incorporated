const mysql = require('./lib/mysql')
const buildingsUtils = require('shared-lib/buildingsUtils')

module.exports = app => {
  async function updateMoney(req) {
    req.userData.income_per_second = await getUserIncomePerSecond(req.userData.id)
    const tsNow = Math.floor(Date.now() / 1000)
    const moneyUpdateElapsedS = tsNow - req.userData.last_money_update
    if (moneyUpdateElapsedS > 1) {
      const moneyAdded = req.userData.income_per_second * moneyUpdateElapsedS
      await mysql.query('UPDATE users SET money=money+?, last_money_update=? WHERE id=?', [
        moneyAdded,
        tsNow,
        req.userData.id,
      ])
      req.userData.money += moneyAdded
    }
    req.userData.money = Math.round(req.userData.money)
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

        // Update money
        await updateMoney(req)
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

    res.json = function() {
      if (req.userData) {
        // Modify response to include extra data for logged in users
        const extraData = {
          money: req.userData.money,
          income_per_second: req.userData.income_per_second,
        }
        arguments[0]._extra = extraData
      }
      oldJson.apply(res, arguments)
    }
    next()
  }

  app.use(authMiddleware)
  app.use(modifyResponseBody)
}

async function getUserIncomePerSecond(userID) {
  const [buildingsRaw] = await mysql.query('SELECT id, quantity FROM buildings WHERE user_id=?', [userID])
  let [[optimizeResearchLevel]] = await mysql.query('SELECT level FROM research WHERE user_id=? AND id=5', [userID])
  optimizeResearchLevel = optimizeResearchLevel ? optimizeResearchLevel.level : 0

  return buildingsRaw.reduce(
    (prev, curr) => prev + buildingsUtils.calcBuildingIncomePerSecond(curr.id, curr.quantity, optimizeResearchLevel),
    0
  )
}
