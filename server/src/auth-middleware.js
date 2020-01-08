const mysql = require('./lib/mysql')
const {
  getResearchs,
  getPersonnel,
  getUnreadMessagesCount,
  getUserPersonnelCosts,
  getBuildings,
} = require('./lib/db/users')
const { getUserAllianceID } = require('./lib/db/alliances')
const { calcBuildingDailyIncome, calcBuildingMaxMoney } = require('shared-lib/buildingsUtils')
const { getIncomeTaxes } = require('shared-lib/taxes')

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

      const [researchs, personnel, buildings] = await Promise.all([
        getResearchs(req.userData.id),
        getPersonnel(req.userData.id),
        getBuildings(req.userData.id),
      ])

      req.userData.researchs = researchs
      req.userData.personnel = personnel
      req.userData.buildings = buildings

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
  if (moneyUpdateElapsedS < 1) return
  await mysql.query('UPDATE users SET last_money_update=? WHERE id=?', [tsNow, req.userData.id])

  // Buildings Income
  const [buildings] = await mysql.query('SELECT id, quantity, money FROM buildings WHERE user_id=?', [req.userData.id])

  const buildingsIncomes = buildings.map(building => ({
    id: building.id,
    quantity: building.quantity,
    income: calcBuildingDailyIncome(building.id, building.quantity, req.userData.researchs[5]),
  }))
  const totalBuildingsIncome = buildingsIncomes.reduce((prev, curr) => prev + curr.income, 0)
  const hasAlliance = await getUserAllianceID(req.userData.id)
  const taxesPct = getIncomeTaxes(totalBuildingsIncome, hasAlliance)

  await Promise.all(
    buildingsIncomes.map(async building => {
      const maxMoney = calcBuildingMaxMoney({
        buildingID: building.id,
        buildingAmount: building.quantity,
        bankResearchLevel: req.userData.researchs[4],
      })
      if (building.money >= maxMoney.maxTotal) return

      const buildingRevenue = building.income * (1 - taxesPct)
      const moneyGenerated = (buildingRevenue / 24 / 60 / 60) * moneyUpdateElapsedS

      await mysql.query('UPDATE buildings SET money=money+? WHERE user_id=? AND id=?', [
        moneyGenerated,
        req.userData.id,
        building.id,
      ])
    })
  )

  // Personnel Costs
  const personnelCosts = ((await getUserPersonnelCosts(req.userData.id)) / 24 / 60 / 60) * moneyUpdateElapsedS
  await mysql.query('UPDATE users SET money=money-? WHERE id=?', [personnelCosts, req.userData.id])
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
