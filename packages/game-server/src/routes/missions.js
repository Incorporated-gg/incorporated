import locks from '../lib/locks'
import mysql from '../lib/mysql'
import {
  getUserTodaysMissionsLimits,
  getUserPersonnel,
  getHasActiveMission,
  getUserData,
  getUnreadReportsCount,
} from '../lib/db/users'
import { parseMissionFromDB } from '../lib/db/missions'
import { getAllianceMembers, getUserAllianceID } from '../lib/db/alliances'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { calculateMissionTime, calculateIsInAttackRange } from 'shared-lib/missionsUtils'
import { getHoodData } from '../lib/db/hoods'

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

  app.post('/v1/missions/cancel', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const [
      mission,
    ] = await mysql.query('SELECT id, mission_type FROM missions WHERE user_id=? AND completed=? AND started_at=?', [
      req.userData.id,
      false,
      req.body.started_at,
    ])
    if (!mission) {
      res.status(400).json({
        error: 'Misión no encontrada',
      })
      return
    }

    // Update
    await mysql.query('DELETE FROM missions WHERE id=?', [mission.id])

    res.json({
      success: true,
    })
  })

  app.post('/v1/missions/create', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    // Locks
    const lockName = `activeMission:${req.userData.id}`
    const removeLock = () => locks.remove(lockName)
    if ((await getHasActiveMission(req.userData.id)) || locks.get(lockName)) {
      res.status(400).json({
        error: 'Ya tienes una misión en curso',
      })
      return
    }
    locks.set(lockName, Date.now())

    // Find target (hood or user)
    const missionType = req.body.mission_type
    const targetHoodData = missionType === 'attack' && (await getHoodData(req.body.target_hood))
    const targetUser =
      !targetHoodData && (await mysql.selectOne('SELECT id FROM users WHERE username = ?', [req.body.target_user]))

    if (!targetUser && !targetHoodData) {
      res.status(400).json({
        error: 'El usuario indicado no existe',
      })
      removeLock()
      return
    }

    const sentSpies = parseInt(req.body.sent_spies) || 0
    const sentSabots = parseInt(req.body.sent_sabots) || 0
    const sentThieves = parseInt(req.body.sent_thieves) || 0
    const attackUserTargetBuilding = req.body.target_building ? parseInt(req.body.target_building) : undefined

    const userPersonnel = await getUserPersonnel(req.userData.id)
    switch (missionType) {
      case 'attack': {
        if (targetUser) {
          // Detect possible errors when attacking users
          if (!buildingsList.find(b => b.id === attackUserTargetBuilding)) {
            res.status(400).json({ error: 'El edificio enviado no existe' })
            removeLock()
            return
          }
          // Ensure daily defenses limit
          const targetUserMissionLimits = await getUserTodaysMissionsLimits(targetUser.id)
          if (targetUserMissionLimits.receivedToday >= targetUserMissionLimits.maxDefenses) {
            res
              .status(400)
              .json({ error: `Este usuario ya ha sido atacado ${targetUserMissionLimits.maxDefenses} veces hoy` })
            removeLock()
            return
          }
          const targetUserData = await getUserData(targetUser.id)
          const userIncome = (await getUserData(req.userData.id)).income
          const isInAttackRange = calculateIsInAttackRange(userIncome, targetUserData.income)
          if (!isInAttackRange) {
            res.status(400).json({
              error: 'No puedes atacar usuarios fuera de tu zona de ataque',
            })
            removeLock()
            return
          }
        }
        if (targetHoodData) {
          // Detect possible errors when attacking hoods
          if (targetHoodData.owner) {
            res.status(400).json({ error: 'Este barrio ya tiene dueño' })
            removeLock()
            return
          }
        }
        // Detect common errors for attacking users or hoods
        if (sentSabots + sentThieves < 1) {
          res.status(400).json({
            error: 'Debes enviar algunos gángsters o ladrones',
          })
          removeLock()
          return
        }
        if (userPersonnel.sabots < sentSabots) {
          res.status(400).json({
            error: 'No tienes suficientes gángsters',
          })
          removeLock()
          return
        }
        if (userPersonnel.thieves < sentThieves) {
          res.status(400).json({
            error: 'No tienes suficientes ladrones',
          })
          removeLock()
          return
        }
        const attackedAllianceID = await getUserAllianceID(targetUser.id)
        const myAllianceID = await getUserAllianceID(req.userData.id)
        if (myAllianceID && attackedAllianceID === myAllianceID) {
          res.status(400).json({
            error: 'No puedes atacar a alguien de tu alianza',
          })
          removeLock()
          return
        }

        // Ensure daily attacks limit
        const userMissionLimits = await getUserTodaysMissionsLimits(req.userData.id)
        if (userMissionLimits.attacksLeft <= 0) {
          res.status(400).json({ error: 'No te quedan ataques disponibles' })
          removeLock()
          return
        }
        break
      }
      case 'spy':
        if (sentSpies < 1) {
          res.status(400).json({
            error: 'Debes enviar algunos espías',
          })
          removeLock()
          return
        }
        if (userPersonnel.spies < sentSpies) {
          res.status(400).json({
            error: 'No tienes suficientes espías',
          })
          removeLock()
          return
        }

        break
      default:
        res.status(400).json({
          error: 'Tipo de misión no soportada',
        })
        removeLock()
        return
    }

    const missionDuration = calculateMissionTime(missionType)
    const tsNow = Math.floor(Date.now() / 1000)
    const data = {}
    if (missionType === 'spy') {
      data.spies = sentSpies
    } else if (missionType === 'attack') {
      if (targetUser) {
        data.building = attackUserTargetBuilding
      }
      if (targetHoodData) {
        data.hood = targetHoodData.id
      }
      data.sabots = sentSabots
      data.thieves = sentThieves
    }
    const targetUserID = targetUser ? targetUser.id : 0
    await mysql.query(
      'INSERT INTO missions (user_id, mission_type, data, target_user, started_at, will_finish_at) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userData.id, missionType, JSON.stringify(data), targetUserID, tsNow, tsNow + missionDuration]
    )
    res.json({
      success: true,
    })
    removeLock()
  })
}
