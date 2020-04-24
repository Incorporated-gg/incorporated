import mysql from '../../lib/mysql'
import { getUserAllianceRank, getWarData, getAllianceBasicData } from '../../lib/db/alliances'

module.exports = app => {
  app.post('/v1/alliance/war_aid/accept', async function(req, res) {
    await acceptOrRejectAidRequest({ req, res, isAccepting: true })
  })

  app.post('/v1/alliance/war_aid/reject', async function(req, res) {
    await acceptOrRejectAidRequest({ req, res, isAccepting: false })
  })

  app.post('/v1/alliance/war_aid/request', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_declare_war) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const warID = parseInt(req.body.war_id)
    const aidingAllianceID = parseInt(req.body.aiding_alliance_id)

    if (aidingAllianceID === userRank.alliance_id) {
      res.status(401).json({ error: 'Detalles inválidos' })
      return
    }

    const doesWarExistAndIsActive = await mysql.selectOne(
      'SELECT 1 FROM alliances_wars WHERE id=? AND completed=0 AND (alliance1_id=? OR alliance2_id=?)',
      [warID, userRank.alliance_id, userRank.alliance_id]
    )
    if (!doesWarExistAndIsActive) {
      res.status(401).json({ error: 'Guerra no encontrada' })
      return
    }

    const {
      count: currentAidRequestsCount,
    } = await mysql.selectOne(
      'SELECT COUNT(*) as count FROM alliances_wars_aid WHERE war_id=? AND aided_alliance_id=?',
      [warID, userRank.alliance_id]
    )
    if (currentAidRequestsCount >= 3) {
      res.status(401).json({ error: 'Ya tienes 3 peticiones de ayuda' })
      return
    }

    const doesAidRequestExist = await mysql.selectOne(
      'SELECT 1 FROM alliances_wars_aid WHERE war_id=? AND aided_alliance_id=? AND aiding_alliance_id=?',
      [warID, userRank.alliance_id, aidingAllianceID]
    )
    if (doesAidRequestExist) {
      res.status(401).json({ error: 'Ya tienes una petición a esta alianza' })
      return
    }

    const tsNow = Math.floor(Date.now() / 1000)

    await mysql.query(
      'INSERT INTO alliances_wars_aid (war_id, aided_alliance_id, aiding_alliance_id, created_at) VALUES (?, ?, ?, ?)',
      [warID, userRank.alliance_id, aidingAllianceID, tsNow]
    )

    res.json({ success: true })
  })

  app.get('/v1/alliance/war_aid/list', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_declare_war) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const warRequestsRaw = await mysql.query(
      'SELECT war_id, aided_alliance_id FROM alliances_wars_aid WHERE accepted=0 AND aiding_alliance_id=?',
      [userRank.alliance_id]
    )

    const warRequests = await Promise.all(
      warRequestsRaw.map(async warRequestRaw => {
        const warData = await getWarData(warRequestRaw.war_id)
        return {
          war: warData,
          alliance: await getAllianceBasicData(warRequestRaw.aided_alliance_id),
        }
      })
    )
    res.json({ war_requests: warRequests })
  })
}

async function acceptOrRejectAidRequest({ req, res, isAccepting }) {
  const warID = req.body.war_id
  const aidedAllianceID = req.body.aided_alliance_id

  const userRank = await getUserAllianceRank(req.userData.id)
  if (!userRank || !userRank.permission_declare_war) {
    res.status(401).json({ error: 'No tienes permiso para hacer esto' })
    return
  }

  const doesAidRequestExist = await mysql.selectOne(
    'SELECT 1 FROM alliances_wars_aid WHERE accepted=0 AND war_id=? AND aided_alliance_id=? AND aiding_alliance_id=?',
    [warID, aidedAllianceID, userRank.alliance_id]
  )
  if (!doesAidRequestExist) {
    res.status(401).json({ error: 'Esta petición no existe' })
    return
  }

  if (isAccepting) {
    const tsNow = Math.floor(Date.now() / 1000)

    await mysql.query(
      'UPDATE alliances_wars_aid SET accepted=1, accepted_at=? WHERE war_id=? AND aided_alliance_id=? AND aiding_alliance_id=?',
      [tsNow, warID, aidedAllianceID, userRank.alliance_id]
    )
  } else {
    await mysql.query(
      'DELETE FROM alliances_wars_aid WHERE war_id=? AND aided_alliance_id=? AND aiding_alliance_id=?',
      [warID, aidedAllianceID, userRank.alliance_id]
    )
  }

  res.json({ success: true })
}
