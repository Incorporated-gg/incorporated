import mysql from '../lib/mysql'
import { upgradeUserResearch } from '../lib/db/researchs'
import {
  researchList,
  calcResearchPrice,
  calcResearchSecondsDuration,
  MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS,
} from 'shared-lib/researchUtils'
import { logUserActivity } from '../lib/accountInternalApi'

module.exports = app => {
  app.post('/v1/research/buy', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.research_id || !req.body.count) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }
    const researchID = req.body.research_id
    const count = 1 // TODO: Use req.body.count
    if (count > 1) throw new Error('Not implemented yet')

    const researchInfo = researchList.find(b => b.id === researchID)
    if (!researchInfo) {
      res.status(400).json({ error: 'Invalid research_id' })
      return
    }

    const price = calcResearchPrice(researchID, req.userData.researchs[researchID])
    if (price > req.userData.money) {
      res.status(400).json({ error: 'No tienes suficiente dinero' })
      return
    }

    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])
    req.userData.money -= price

    const activeResearchRowExists = await mysql.selectOne(
      'SELECT 1 FROM research_active WHERE user_id=? and research_id=?',
      [req.userData.id, researchID]
    )
    if (activeResearchRowExists) {
      res.status(400).json({ error: 'Ya estás mejorando esta investigación' })
      return
    }

    const researchTime = calcResearchSecondsDuration(researchID, req.userData.researchs[researchID])
    const tsNow = Math.floor(Date.now() / 1000)
    const finishesAt = tsNow + researchTime

    if (researchTime === 0) {
      await upgradeUserResearch(req.userData.id, researchID)
      req.userData.researchs[researchID] += 1
    } else {
      await mysql.query('INSERT INTO research_active (user_id, research_id, finishes_at) VALUES (?, ?, ?)', [
        req.userData.id,
        researchID,
        finishesAt,
      ])
    }

    logUserActivity({
      userId: req.userData.id,
      date: Date.now(),
      ip: req.ip,
      message: '',
      type: 'researchStart',
      extra: {
        researchID,
        finishesAt,
      },
    })

    res.json({
      success: true,
    })
  })

  app.post('/v1/research/manually_finish', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    if (!req.body.research_id) {
      res.status(400).json({ error: 'Faltan datos' })
      return
    }
    const researchID = req.body.research_id

    const activeResearch = await mysql.selectOne(
      'SELECT finishes_at FROM research_active WHERE user_id=? and research_id=?',
      [req.userData.id, researchID]
    )
    if (!activeResearch) {
      res.status(400).json({ error: 'No estás mejorando esta investigación' })
      return
    }

    const tsNow = Math.floor(Date.now() / 1000)
    const secondsLeft = activeResearch.finishes_at - tsNow
    if (secondsLeft > MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS) {
      res.status(400).json({ error: 'Aún no puedes acabar esta mejora' })
      return
    }

    await mysql.query('DELETE FROM research_active WHERE user_id=? and research_id=?', [req.userData.id, researchID])
    await upgradeUserResearch(req.userData.id, researchID)
    req.userData.researchs[researchID] += 1

    logUserActivity({
      userId: req.userData.id,
      date: Date.now(),
      ip: req.ip,
      message: '',
      type: 'researchManuallyEnded',
      extra: {
        researchID,
        secondsLeft,
      },
    })

    res.json({
      success: true,
    })
  })
}
