import locks from '../../lib/locks'
import mysql from '../../lib/mysql'
import {
  getUserTodaysMissionsLimits,
  getUserPersonnel,
  getHasActiveMission,
  getUserData,
  getAttacksTodayFromUserToAnotherUser,
} from '../../lib/db/users'
import { getUserAllianceID } from '../../lib/db/alliances'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { calculateMissionTime, calculateIsInAttackRange } from 'shared-lib/missionsUtils'
import { getHoodData } from '../../lib/db/hoods'

module.exports = app => {
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

    const missionType = req.body.mission_type

    switch (missionType) {
      case 'attack': {
        try {
          await createAttackMission({ req, res })
        } catch (err) {
          removeLock()
          throw err
        }
        break
      }
      case 'spy': {
        try {
          await createSpyMission({ req, res })
        } catch (err) {
          removeLock()
          throw err
        }
        break
      }
      default: {
        res.status(400).json({
          error: 'Tipo de misión no soportada',
        })
      }
    }

    removeLock()
  })
}

async function createAttackMission({ req, res }) {
  // Find target (hood or user)
  const targetHoodData = await getHoodData(req.body.target_hood)
  const targetUser =
    !targetHoodData && (await mysql.selectOne('SELECT id FROM users WHERE username = ?', [req.body.target_user]))

  if (!targetUser && !targetHoodData) {
    res.status(400).json({
      error: 'El usuario indicado no existe',
    })
    return
  }

  const sentSabots = parseInt(req.body.sent_sabots) || 0
  const sentThieves = parseInt(req.body.sent_thieves) || 0
  const attackUserTargetBuilding = req.body.target_building ? parseInt(req.body.target_building) : undefined

  const userPersonnel = await getUserPersonnel(req.userData.id)
  if (targetUser) {
    // Detect possible errors when attacking users
    if (!buildingsList.find(b => b.id === attackUserTargetBuilding)) {
      res.status(400).json({ error: 'El edificio enviado no existe' })
      return
    }
    // Ensure daily defenses limit
    const targetUserMissionLimits = await getUserTodaysMissionsLimits(targetUser.id)
    if (targetUserMissionLimits.receivedToday >= targetUserMissionLimits.maxDefenses) {
      res
        .status(400)
        .json({ error: `Este jugador ya ha sido atacado ${targetUserMissionLimits.maxDefenses} veces hoy` })
      return
    }
    const attacksTodayFromMe = await getAttacksTodayFromUserToAnotherUser(req.userData.id, targetUser.id)
    if (attacksTodayFromMe >= 3) {
      res.status(400).json({ error: `Ya has atacado 3 veces hoy a este jugador` })
      return
    }

    const targetUserData = await getUserData(targetUser.id)
    const userIncome = (await getUserData(req.userData.id)).income
    const isInAttackRange = calculateIsInAttackRange(userIncome, targetUserData.income)
    if (!isInAttackRange) {
      res.status(400).json({
        error: 'No puedes atacar usuarios fuera de tu zona de ataque',
      })
      return
    }
  }
  if (targetHoodData) {
    // Detect possible errors when attacking hoods
    if (!targetHoodData.isAttackable) {
      res.status(400).json({
        error: 'Este barrio ha sido atacado hace poco. Tendremos que esperar un tiempo a que la situación se calme',
      })
      return
    }
  }
  // Detect common errors for attacking users or hoods
  if (sentSabots + sentThieves < 1) {
    res.status(400).json({
      error: 'Debes enviar algunos gángsters o ladrones',
    })
    return
  }
  if (userPersonnel.sabots < sentSabots) {
    res.status(400).json({
      error: 'No tienes suficientes gángsters',
    })
    return
  }
  if (userPersonnel.thieves < sentThieves) {
    res.status(400).json({
      error: 'No tienes suficientes ladrones',
    })
    return
  }
  const attackedAllianceID = await getUserAllianceID(targetUser.id)
  const myAllianceID = await getUserAllianceID(req.userData.id)
  if (myAllianceID && attackedAllianceID === myAllianceID) {
    res.status(400).json({
      error: 'No puedes atacar a alguien de tu alianza',
    })
    return
  }

  // Ensure daily attacks limit
  const userMissionLimits = await getUserTodaysMissionsLimits(req.userData.id)
  if (userMissionLimits.attacksLeft <= 0) {
    res.status(400).json({ error: 'No te quedan ataques disponibles' })
    return
  }

  const missionDuration = calculateMissionTime('attack')
  const tsNow = Math.floor(Date.now() / 1000)
  const data = {
    sabots: sentSabots,
    thieves: sentThieves,
  }
  if (targetUser) {
    data.building = attackUserTargetBuilding
  }
  if (targetHoodData) {
    data.hood = targetHoodData.id
  }

  const targetUserID = targetUser ? targetUser.id : 0
  await mysql.query(
    'INSERT INTO missions (user_id, mission_type, data, target_user, started_at, will_finish_at) VALUES (?, ?, ?, ?, ?, ?)',
    [req.userData.id, 'attack', JSON.stringify(data), targetUserID, tsNow, tsNow + missionDuration]
  )
  res.json({
    success: true,
  })
}

async function createSpyMission({ req, res }) {
  // Find target (hood or user)
  const targetUser = await mysql.selectOne('SELECT id FROM users WHERE username = ?', [req.body.target_user])

  if (!targetUser) {
    res.status(400).json({
      error: 'El usuario indicado no existe',
    })
    return
  }

  const sentSpies = parseInt(req.body.sent_spies) || 0

  const userPersonnel = await getUserPersonnel(req.userData.id)

  if (sentSpies < 1) {
    res.status(400).json({
      error: 'Debes enviar algunos espías',
    })
    return
  }
  if (userPersonnel.spies < sentSpies) {
    res.status(400).json({
      error: 'No tienes suficientes espías',
    })
    return
  }

  const missionDuration = calculateMissionTime('spy')
  const tsNow = Math.floor(Date.now() / 1000)
  const data = {
    spies: sentSpies,
  }
  const targetUserID = targetUser ? targetUser.id : 0
  await mysql.query(
    'INSERT INTO missions (user_id, mission_type, data, target_user, started_at, will_finish_at) VALUES (?, ?, ?, ?, ?, ?)',
    [req.userData.id, 'spy', JSON.stringify(data), targetUserID, tsNow, tsNow + missionDuration]
  )
  res.json({
    success: true,
  })
}
