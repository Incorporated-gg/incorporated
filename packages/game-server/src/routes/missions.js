import locks from '../lib/locks'
import { hoods } from '../lib/map'
import mysql from '../lib/mysql'
import { getUserTodaysMissionsLimits, getPersonnel, hasActiveMission, getData as getUserData } from '../lib/db/users'
import { parseMissionFromDB } from '../lib/db/missions'
import { getMembers } from '../lib/db/alliances'
const { getUserAllianceID } = require('../lib/db/alliances')
const { buildingsList } = require('shared-lib/buildingsUtils')
const { calculateMissionTime, NEWBIE_ZONE_DAILY_INCOME } = require('shared-lib/missionsUtils')

module.exports = app => {
  app.get('/v1/missions', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    // Misc stuff that we always need to return
    let [
      { last_checked_reports_at: lastCheckedReportsAt },
    ] = await mysql.query('SELECT last_checked_reports_at FROM users WHERE id=?', [req.userData.id])
    lastCheckedReportsAt = lastCheckedReportsAt || 0

    const sentMissionsRaw = await mysql.query(
      'SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE user_id=? AND completed=1 ORDER BY will_finish_at DESC LIMIT 100',
      [req.userData.id]
    )
    const receivedMissionsRaw = await mysql.query(
      'SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions WHERE target_user=? AND mission_type="attack" AND completed=1 ORDER BY will_finish_at DESC LIMIT 100',
      [req.userData.id]
    )
    const [sentMissions, receivedMissions] = await Promise.all([
      Promise.all(sentMissionsRaw.map(parseMissionFromDB)),
      Promise.all(receivedMissionsRaw.map(parseMissionFromDB)),
    ])

    const notSeenReceivedCount = receivedMissions.filter(
      mission => mission.completed && mission.will_finish_at > lastCheckedReportsAt
    ).length
    const notSeenSentCount = sentMissions.filter(
      mission => mission.completed && mission.will_finish_at > lastCheckedReportsAt
    ).length

    const todaysMissionLimits = await getUserTodaysMissionsLimits(req.userData.id)

    mysql.query('UPDATE users SET last_checked_reports_at=? WHERE id=?', [
      Math.floor(Date.now() / 1000),
      req.userData.id,
    ])

    // Actual info requested
    let missions = []
    const sendType = req.query.sendType
    const missionType = req.query.missionType
    const ownerType = req.query.ownerType

    if (ownerType === 'own') {
      // Own reports
      // We use the info already gotten previously, but if that gets optimized we could make our own query like in the alliance part below
      missions = sendType === 'sent' ? sentMissions : receivedMissions
      if (missionType !== 'any') missions = missions.filter(mission => mission.mission_type === missionType)
    } else if (ownerType === 'alliance') {
      // Whole alliance reports
      const allianceID = await getUserAllianceID(req.userData.id)
      if (allianceID) {
        const allianceMembers = await getMembers(allianceID)
        const allianceMemberIDs = allianceMembers.map(user => user.user.id)

        // Construct query using the query params (sendType, missionType)
        const userWhere = `WHERE ${sendType === 'sent' ? 'user_id' : 'target_user'} IN (?)`
        const missionTypeWhere =
          missionType === 'attack' ? "AND mission_type='attack'" : missionType === 'spy' ? "AND mission_type='spy'" : ''
        const selectEnd = 'AND completed=1 ORDER BY will_finish_at DESC LIMIT 100'
        const selectQuery = `SELECT user_id, target_user, data, mission_type, started_at, will_finish_at, completed, result, profit FROM missions ${userWhere} ${missionTypeWhere} ${selectEnd}`

        const missionsRaw = await mysql.query(selectQuery, [allianceMemberIDs])
        missions = await Promise.all(missionsRaw.map(parseMissionFromDB))
      }
    }

    res.json({
      todaysMissionLimits,
      notSeenReceivedCount,
      notSeenSentCount,
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
    if ((await hasActiveMission(req.userData.id)) || locks.get(lockName)) {
      res.status(400).json({
        error: 'Ya tienes una misión en curso',
      })
      return
    }
    locks.set(lockName, Date.now())

    // Find target (hood or user)
    const missionType = req.body.mission_type
    const targetHood = missionType === 'attack' && hoods.find(hood => hood.id === req.body.target_hood)
    const targetUser =
      !targetHood && (await mysql.selectOne('SELECT id FROM users WHERE username = ?', [req.body.target_user]))

    if (!targetUser && !targetHood) {
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

    const userPersonnel = await getPersonnel(req.userData.id)
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
          if (targetUserData.income < NEWBIE_ZONE_DAILY_INCOME) {
            res.status(400).json({
              error: 'No puedes atacar usuarios en la zona newbie',
            })
            removeLock()
            return
          }
        }
        if (targetHood) {
          // Detect possible errors when attacking hoods
          if (targetHood.owner) {
            res.status(400).json({ error: 'Este barrio ya tiene dueño' })
            removeLock()
            return
          }
        }
        // Detect common errors for attacking users or hoods
        if (sentSabots + sentThieves < 1) {
          res.status(400).json({
            error: 'Debes enviar algunos saboteadores o ladrones',
          })
          removeLock()
          return
        }
        if (userPersonnel.sabots < sentSabots) {
          res.status(400).json({
            error: 'No tienes suficientes saboteadores',
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
        if (userMissionLimits.sentToday >= userMissionLimits.maxAttacks) {
          res.status(400).json({ error: `Ya has atacado ${userMissionLimits.maxAttacks} veces hoy` })
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
      if (targetHood) {
        data.hood = targetHood.id
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
