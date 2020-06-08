import mysql from '../../lib/mysql'
import {
  getUserAllianceID,
  getAllianceBasicData,
  getAllianceMembers,
  getAllianceResearchs,
  getAllianceResources,
  getAllianceResourcesLog,
  getAllianceResearchShares,
  getAllianceBuffsData,
  getUserAllianceRank,
  getAllianceResearchLog,
} from '../../lib/db/alliances'
import { getActiveMission, getUserPersonnel } from '../../lib/db/users'
import { updatePersonnelAmount } from '../../lib/db/personnel'
import { calcResearchPrice, calcAllianceResourceMax } from 'shared-lib/allianceUtils'
import { allianceUpdateResource } from '../../lib/db/alliances/resources'
import { getAllianceActiveWars, getAlliancePastWars } from '../../lib/db/alliances/war'

module.exports = app => {
  app.get('/v1/alliance', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const allianceID = await getUserAllianceID(req.userData.id)
    if (!allianceID) {
      res.json({ alliance: false })
      return
    }
    const basicData = await getAllianceBasicData(allianceID)
    if (!basicData) {
      res.json({ alliance: false })
      return
    }

    const [
      members,
      researchs,
      resources,
      resourcesLog,
      researchLog,
      researchShares,
      buffsData,
      activeWars,
      pastWars,
    ] = await Promise.all([
      getAllianceMembers(allianceID),
      getAllianceResearchs(allianceID),
      getAllianceResources(allianceID),
      getAllianceResourcesLog(allianceID),
      getAllianceResearchLog(allianceID),
      getAllianceResearchShares(allianceID),
      getAllianceBuffsData(allianceID),
      getAllianceActiveWars(allianceID),
      getAlliancePastWars(allianceID),
    ])

    const ranks = await Promise.all(
      members.map(async member => ({
        user: member.user,
        rank: await getUserAllianceRank(member.user.id),
      }))
    )

    const alliance = {
      ...basicData,
      members,
      ranks,
      researchs,
      resources,
      resources_log: resourcesLog,
      research_log: researchLog,
      research_shares: researchShares,
      buffs_data: buffsData,
      active_wars: activeWars,
      past_wars: pastWars,
    }

    res.json({ alliance })
  })

  app.post('/v1/alliance/research', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.amount || !req.body.research_id) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }
    const allianceID = await getUserAllianceID(req.userData.id)
    if (!allianceID) {
      res.status(401).json({ error: 'No tienes una alianza' })
      return
    }

    const allianceResearchs = await getAllianceResearchs(allianceID)
    const researchID = req.body.research_id
    const researchData = allianceResearchs[researchID]
    if (!allianceID) {
      res.status(401).json({ error: 'Investigación no encontrada' })
      return
    }

    // Check money
    const moneyAmount = parseInt(req.body.amount)
    if (Number.isNaN(moneyAmount) || moneyAmount <= 0) {
      res.status(400).json({ error: 'Cantidad incorrecta' })
      return
    }
    if (req.userData.money < moneyAmount) {
      res.status(401).json({ error: 'No tienes suficiente dinero' })
      return
    }
    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [moneyAmount, req.userData.id])

    // Log
    await mysql.query(
      'INSERT INTO alliances_research_log (alliance_id, user_id, created_at, research_id, money) VALUES (?, ?, ?, ?, ?)',
      [allianceID, req.userData.id, Math.floor(Date.now() / 1000), researchID, moneyAmount]
    )

    // Update alliances_research table
    let newProgressMoney = researchData.progress_money + moneyAmount
    let newLevel = researchData.level - researchData.bonusLvlsFromHoods
    let newPrice = researchData.price
    while (newProgressMoney >= newPrice) {
      newLevel++
      newProgressMoney -= newPrice
      newPrice = calcResearchPrice(researchID, newLevel)
    }

    const updateResult = await mysql.query(
      'UPDATE alliances_research SET level=?, progress_money=? WHERE alliance_id=? AND id=?',
      [newLevel, newProgressMoney, allianceID, researchID]
    )
    if (updateResult.changedRows === 0) {
      await mysql.query('INSERT INTO alliances_research (id, alliance_id, level, progress_money) VALUES (?, ?, ?, ?)', [
        researchID,
        allianceID,
        newLevel,
        newProgressMoney,
      ])
    }

    res.json({
      success: true,
      new_price: newPrice,
      new_progress_money: newProgressMoney,
      new_level: newLevel,
    })
  })

  app.post('/v1/alliance/resources', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const resourceID = req.body.resource_id
    const resourceAmount = parseInt(req.body.amount)

    if (resourceID !== 'sabots' && resourceID !== 'guards' && resourceID !== 'thieves') {
      res.status(400).json({ error: 'Recurso no implementado' })
      return
    }

    const userRank = await getUserAllianceRank(req.userData.id)
    const allianceID = userRank.alliance_id
    if (!userRank) {
      res.status(401).json({ error: 'No tienes alianza' })
      return
    }

    if (!req.body.amount || !req.body.resource_id) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }

    const activeMission = await getActiveMission(req.userData.id)
    if (activeMission) {
      if ((resourceID === 'sabots' || resourceID === 'thieves') && activeMission.mission_type === 'attack') {
        res.status(400).json({
          error: 'Tienes una misión en curso',
        })
        return
      }
    }

    // Get personnel now instead of req.userData.personnel, to avoid exploits. Might be unnecessary once locks are in place
    const [allianceResearchs, allianceResources, userPersonnel] = await Promise.all([
      getAllianceResearchs(allianceID),
      getAllianceResources(allianceID),
      getUserPersonnel(req.userData.id),
    ])

    const allianceResourceAmount = allianceResources[resourceID]
    if (resourceAmount < 0 && allianceResourceAmount < -resourceAmount) {
      res.status(401).json({ error: 'No hay suficientes recursos' })
      return
    }

    const mapResourceIDToResearchID = {
      guards: 2,
      sabots: 3,
      thieves: 4,
    }
    const researchID = mapResourceIDToResearchID[resourceID]
    const researchLevel = allianceResearchs[researchID].level
    const maxResourceStorage = calcAllianceResourceMax(researchID, researchLevel)
    if (allianceResources[resourceID] + resourceAmount > maxResourceStorage) {
      res.status(401).json({ error: 'No caben tantos recursos' })
      return
    }

    // Make sure the user has enough resources/space for them
    if (resourceAmount < 0 && !userRank.permission_extract_resources) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }
    if (resourceAmount > 0 && userPersonnel[resourceID] < resourceAmount) {
      res.status(401).json({ error: 'No tienes suficientes recursos' })
      return
    }

    await Promise.all([
      allianceUpdateResource({
        type: resourceAmount < 0 ? 'extract' : 'deposit',
        resourceID,
        resourceDiff: resourceAmount,
        userID: req.userData.id,
        allianceID,
      }),
      updatePersonnelAmount(req, resourceID, -resourceAmount),
    ])

    res.json({
      success: true,
    })
  })
}
