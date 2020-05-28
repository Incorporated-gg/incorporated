import { getUserActiveTasks } from './lib/db/tasks'
import { getAccountData } from './lib/accountInternalApi'
import mysql from './lib/mysql'
import {
  getUserResearchs,
  getUserPersonnel,
  getUnreadMessagesCount,
  getUnreadReportsCount,
  getUserBuildings,
  runUserMoneyUpdate,
  getActiveMission,
} from './lib/db/users'
import { getUserIDFromSessionID } from './lib/db/sessions'
import { getAllianceResources, getUserAllianceID } from './lib/db/alliances'

module.exports = app => {
  app.use(authMiddleware)
  app.use(modifyResponseBody)
}

async function authMiddleware(req, res, next) {
  req.userData = null

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
      const sessionID = req.headers.authorization.replace('Basic ', '')
      const userID = await getUserIDFromSessionID(sessionID)
      if (userID) {
        ;[req.userData] = await mysql.query('SELECT id, username, money FROM users WHERE id=?', [userID])

        await runUserMoneyUpdate(req.userData.id)

        const [researchs, personnel, buildings] = await Promise.all([
          getUserResearchs(req.userData.id),
          getUserPersonnel(req.userData.id),
          getUserBuildings(req.userData.id),
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
  } catch (err) {
    res.status(500).json({ error: 'Error interno al validar sesión' })
    console.warn(err.message)
    return
  }

  next()
}

function modifyResponseBody(req, res, next) {
  res.json = async function(jsonResponse) {
    if (req.userData) {
      // Modify response to include extra data for logged in users
      const allianceID = await getUserAllianceID(req.userData.id)
      const [
        unreadMessagesCount,
        unreadReportsCount,
        activeMission,
        activeTasks,
        accountData,
        allianceResources,
      ] = await Promise.all([
        getUnreadMessagesCount(req.userData.id),
        getUnreadReportsCount(req.userData.id),
        getActiveMission(req.userData.id),
        getUserActiveTasks(req.userData.id),
        getAccountData(req.userData.id),
        getAllianceResources(allianceID),
      ])
      const extraData = {
        money: req.userData.money,
        personnel: req.userData.personnel,
        researchs: req.userData.researchs,
        buildings: req.userData.buildings,
        unread_messages_count: unreadMessagesCount,
        unread_reports_count: unreadReportsCount.total,
        active_mission: activeMission,
        allianceResources: allianceID ? allianceResources : null,
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
      jsonResponse._extra = extraData
    }

    // Large json strings were being cut, so we explicitly set the Content-Length to hopefuly fix it
    const resString = JSON.stringify(jsonResponse)
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.header('Content-Length', Buffer.byteLength(resString, 'utf8'))
    res.send(resString)
  }
  next()
}
