import { getUserActiveTasks } from './lib/db/tasks'
import { getAccountData } from './lib/accountInternalApi'
import mysql from './lib/mysql'
const {
  getUserResearchs,
  getPersonnel,
  getUnreadMessagesCount,
  getUnreadReportsCount,
  getBuildings,
  runUserMoneyUpdate,
} = require('./lib/db/users')
const { parseMissionFromDB } = require('./lib/db/missions')
const { getUserIDFromSessionID } = require('./lib/db/sessions')

module.exports = app => {
  app.use(authMiddleware)
  app.use(modifyResponseBody)
}

async function authMiddleware(req, res, next) {
  req.userData = null

  if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
    const sessionID = req.headers.authorization.replace('Basic ', '')
    const userID = await getUserIDFromSessionID(sessionID)
    if (userID) {
      ;[req.userData] = await mysql.query('SELECT id, username, money FROM users WHERE id=?', [userID])

      await runUserMoneyUpdate(req.userData.id)

      const [researchs, personnel, buildings] = await Promise.all([
        getUserResearchs(req.userData.id),
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
      const [unreadMessagesCount, unreadReportsCount, activeMission, activeTasks, accountData] = await Promise.all([
        getUnreadMessagesCount(req.userData.id),
        getUnreadReportsCount(req.userData.id),
        getActiveMission(req.userData.id),
        getUserActiveTasks(req.userData.id),
        getAccountData(req.userData.id),
      ])
      const extraData = {
        money: req.userData.money,
        personnel: req.userData.personnel,
        researchs: req.userData.researchs,
        buildings: req.userData.buildings,
        unread_messages_count: unreadMessagesCount,
        unread_reports_count: unreadReportsCount.total,
        active_mission: activeMission,
        activeTasks,
        account: {
          avatar: accountData.avatar,
          avatarID: accountData.avatarID,
          gold: accountData.gold,
          xp: accountData.xp,
          levelUpXP: accountData.levelUpXP,
          level: accountData.level,
        },
      }
      arguments[0]._extra = extraData
    }
    oldJson.apply(res, arguments)
  }
  next()
}

async function getActiveMission(userID) {
  const [
    mission,
  ] = await mysql.query(
    'SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE user_id=? AND completed=0',
    [userID]
  )
  if (!mission) return null

  return await parseMissionFromDB(mission)
}
