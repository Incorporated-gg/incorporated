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
  getAllianceActiveWars,
  getAlliancePastWars,
  getUserAllianceRank,
  getAllianceResearchLog,
} from '../../lib/db/alliances'
import { getActiveMission } from '../../lib/db/users'
import { updatePersonnelAmount } from '../../lib/db/personnel'
import { calcResourceMax, calcResearchPrice } from 'shared-lib/allianceUtils'

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
    const research = allianceResearchs[researchID]
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
    let newProgressMoney = research.progress_money + moneyAmount
    let newLevel = research.level
    let newPrice = research.price
    while (newProgressMoney >= newPrice) {
      newLevel++
      newProgressMoney -= newPrice
      newPrice = calcResearchPrice(researchID, newLevel)
    }
    const doesDBRowExist = research.level === 0 && research.progress_money === 0
    if (doesDBRowExist) {
      await mysql.query('INSERT INTO alliances_research (id, alliance_id, level, progress_money) VALUES (?, ?, ?, ?)', [
        researchID,
        allianceID,
        newLevel,
        newProgressMoney,
      ])
    } else {
      await mysql.query('UPDATE alliances_research SET level=?, progress_money=? WHERE alliance_id=? AND id=?', [
        newLevel,
        newProgressMoney,
        allianceID,
        researchID,
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

    const allianceResources = await getAllianceResources(allianceID)
    const allianceResearchs = await getAllianceResearchs(allianceID)

    const resourceID = req.body.resource_id
    const resourceAmount = parseInt(req.body.amount)
    const allianceResourceAmount = allianceResources[resourceID].quantity
    if (resourceAmount < 0 && allianceResourceAmount < -resourceAmount) {
      res.status(401).json({ error: 'No hay suficientes recursos' })
      return
    }

    const maxResourceStorage = calcResourceMax(resourceID, allianceResearchs)
    if (allianceResources[resourceID].quantity + resourceAmount > maxResourceStorage) {
      res.status(401).json({ error: 'No caben tantos recursos' })
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

    // Make sure the user has enough resources/space for them
    switch (resourceID) {
      case 'sabots':
      case 'guards':
      case 'thieves':
        if (resourceAmount < 0 && !userRank.permission_extract_resources) {
          res.status(401).json({ error: 'No tienes permiso para hacer esto' })
          return
        }
        if (resourceAmount > 0 && req.userData.personnel[resourceID] < resourceAmount) {
          res.status(401).json({ error: 'No tienes suficientes recursos' })
          return
        }
        await updatePersonnelAmount(req, resourceID, -resourceAmount)

        break
      default:
        res.status(500).json({ error: 'No implementado' })
        return
    }

    await mysql.query(
      'INSERT INTO alliances_resources_log (alliance_id, user_id, created_at, resource_id, quantity) VALUES (?, ?, ?, ?, ?)',
      [allianceID, req.userData.id, Math.floor(Date.now() / 1000), resourceID, resourceAmount]
    )

    if (allianceResources[resourceID].quantity === 0) {
      // INSERT alliances_resources row just in case there is no row. If duplicate, we just catch the error and ignore it
      try {
        await mysql.query('INSERT INTO alliances_resources (alliance_id, resource_id, quantity) VALUES (?, ?, 0)', [
          allianceID,
          resourceID,
        ])
      } catch (e) {}
    }

    await mysql.query('UPDATE alliances_resources SET quantity=quantity+? WHERE alliance_id=? AND resource_id=?', [
      resourceAmount,
      allianceID,
      resourceID,
    ])
    res.json({
      success: true,
    })
  })
}
