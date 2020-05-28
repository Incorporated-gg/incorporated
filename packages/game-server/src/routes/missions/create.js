import locks from '../../lib/locks'
import mysql from '../../lib/mysql'
import {
  getUserTodaysMissionsLimits,
  getUserPersonnel,
  getHasActiveMission,
  getUserData,
  getAttacksTodayFromUserToAnotherUser,
} from '../../lib/db/users'
import { getUserAllianceID, getAllianceResources } from '../../lib/db/alliances'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { calculateMissionTime, calculateIsInAttackRange } from 'shared-lib/missionsUtils'
import { getHoodData } from '../../lib/db/hoods'
import { allianceUpdateResource } from '../../lib/db/alliances/resources'
import { updatePersonnelAmount } from '../../lib/db/personnel'

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

  // Ensure daily attacks limit
  const userMissionLimits = await getUserTodaysMissionsLimits(req.userData.id)
  if (userMissionLimits.attacksLeft <= 0) {
    res.status(400).json({ error: 'No te quedan ataques disponibles' })
    return
  }

  const rebuyLostTroops = Boolean(req.body.rebuy_lost_troops)
  const sentSabots = parseInt(req.body.sent_sabots) || 0
  const sentThieves = parseInt(req.body.sent_thieves) || 0
  const attackUserTargetBuilding = req.body.target_building ? parseInt(req.body.target_building) : undefined

  const userAllianceID = await getUserAllianceID(req.userData.id)
  if (targetUser) {
    // Detect possible errors when attacking users
    if (!buildingsList.find(b => b.id === attackUserTargetBuilding)) {
      res.status(400).json({ error: 'El edificio enviado no existe' })
      return
    }

    const attackedAllianceID = await getUserAllianceID(targetUser.id)
    if (userAllianceID && attackedAllianceID === userAllianceID) {
      res.status(400).json({
        error: 'No puedes atacar a alguien de tu alianza',
      })
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

  if (sentSabots + sentThieves < 1) {
    res.status(400).json({
      error: 'Debes enviar algunos gángsters o ladrones',
    })
    return
  }

  const userPersonnel = await getUserPersonnel(req.userData.id)

  let allianceResources = { sabots: 0, thieves: 0 }
  if (userAllianceID) {
    allianceResources = await getAllianceResources(userAllianceID)
  }

  if (userPersonnel.sabots + allianceResources.sabots < sentSabots) {
    res.status(400).json({
      error: 'No hay suficientes gángsters',
    })
    return
  }
  if (userPersonnel.thieves + allianceResources.thieves < sentThieves) {
    res.status(400).json({
      error: 'No hay suficientes ladrones',
    })
    return
  }

  const allianceID = await getUserAllianceID(req.userData.id)

  const sabotsExtractedFromCorp = Math.max(0, sentSabots - userPersonnel.sabots)
  if (sabotsExtractedFromCorp > 0) {
    await allianceUpdateResource({
      type: 'extract',
      resourceID: 'sabots',
      resourceDiff: -sabotsExtractedFromCorp,
      userID: req.userData.id,
      allianceID,
    })
    await updatePersonnelAmount(req, 'sabots', sabotsExtractedFromCorp)
  }
  const thievesExtractedFromCorp = Math.max(0, sentThieves - userPersonnel.thieves)
  if (thievesExtractedFromCorp > 0) {
    await allianceUpdateResource({
      type: 'extract',
      resourceID: 'thieves',
      resourceDiff: -thievesExtractedFromCorp,
      userID: req.userData.id,
      allianceID,
    })
    await updatePersonnelAmount(req, 'thieves', thievesExtractedFromCorp)
  }

  const missionDuration = calculateMissionTime('attack')
  const tsNow = Math.floor(Date.now() / 1000)
  const data = {
    sabots: sentSabots,
    thieves: sentThieves,
    thievesExtractedFromCorp,
    sabotsExtractedFromCorp,
    rebuyLostTroops,
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

  if (sentSpies < 1) {
    res.status(400).json({
      error: 'Debes enviar algunos espías',
    })
    return
  }
  const userPersonnel = await getUserPersonnel(req.userData.id)
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
