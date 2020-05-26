import mysql from '../../lib/mysql'
import { getUserTodaysMissionsLimits, getUnreadReportsCount } from '../../lib/db/users'
import { parseMissionFromDB } from '../../lib/db/missions'
import { getAllianceMembers, getUserAllianceID } from '../../lib/db/alliances'

module.exports = app => {
  app.get('/v1/missions', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    // It's important to check for invalid inputs to avoid possible vulnerabilities
    const sendType = req.query.sendType // [sent, received]
    if (sendType !== 'sent' && sendType !== 'received') {
      res.status(401).json({ error: 'sendType inválido' })
      return
    }
    const missionType = req.query.missionType // [any, attack, spy]
    if (missionType !== 'any' && missionType !== 'attack' && missionType !== 'spy') {
      res.status(401).json({ error: 'missionType inválido' })
      return
    }
    const ownerType = req.query.ownerType // [own, alliance]
    if (ownerType !== 'own' && ownerType !== 'alliance') {
      res.status(401).json({ error: 'ownerType inválido' })
      return
    }

    // Stuff that's always returned
    const todaysMissionLimits = await getUserTodaysMissionsLimits(req.userData.id)
    const notSeenReports = await getUnreadReportsCount(req.userData.id)

    // Update last_checked_reports_at. Must be run after getUnreadReportsCount
    mysql.query('UPDATE users SET last_checked_reports_at=? WHERE id=?', [
      Math.floor(Date.now() / 1000),
      req.userData.id,
    ])

    // Actual requested missions
    let userWhere
    let queryParams
    if (ownerType === 'own') {
      // Own reports

      userWhere = `WHERE ${sendType === 'sent' ? 'user_id' : 'target_user'} = ?`
      queryParams = [req.userData.id]
    } else if (ownerType === 'alliance') {
      // Whole alliance reports
      const allianceID = await getUserAllianceID(req.userData.id)
      if (!allianceID) {
        res.status(401).json({ error: 'No estás en una alianza' })
        return
      }

      const allianceMembers = await getAllianceMembers(allianceID)
      const allianceMemberIDs = allianceMembers.map(user => user.user.id)

      userWhere = `WHERE ${sendType === 'sent' ? 'user_id' : 'target_user'} IN (?)`
      queryParams = [allianceMemberIDs]
    }

    // Construct query
    const missionTypeWhere =
      missionType === 'attack' ? "AND mission_type='attack'" : missionType === 'spy' ? "AND mission_type='spy'" : ''
    const uncaughtSpionagesWhere = sendType === 'received' ? "AND result!='not_caught'" : '' // Uncaught received spionages shouldn't be reported to the target
    const selectQuery = `SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions ${userWhere} ${missionTypeWhere} ${uncaughtSpionagesWhere} AND completed=1 ORDER BY will_finish_at DESC LIMIT 100`

    const missionsRaw = await mysql.query(selectQuery, queryParams)
    const missions = await Promise.all(missionsRaw.map(parseMissionFromDB))

    res.json({
      todaysMissionLimits,
      notSeenReceivedCount: notSeenReports.notSeenReceivedCount,
      notSeenSentCount: notSeenReports.notSeenSentCount,
      missions,
    })
  })
}
