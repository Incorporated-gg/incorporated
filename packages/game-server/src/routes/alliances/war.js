import { getMaxHoodsAttackedPerWar } from 'shared-lib/allianceUtils'
import { getServerDay } from 'shared-lib/serverTime'
import mysql from '../../lib/mysql'
import {
  getAllianceBasicData,
  getUserAllianceRank,
  getActiveWarBetweenAlliances,
  getAllianceRankData,
  getAllianceMembers,
  getWarData,
} from '../../lib/db/alliances'
import { sendMessage } from '../../lib/db/users'
import { getHoodData } from '../../lib/db/hoods'

module.exports = app => {
  app.post('/v1/alliance/declare_war', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const attackedAllianceID = parseInt(req.body.alliance_id)
    const allianceExists = await getAllianceBasicData(attackedAllianceID)
    if (!allianceExists) {
      res.status(401).json({ error: 'Esa alianza no existe' })
      return
    }

    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_declare_war) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const ourRankData = await getAllianceRankData(userRank.alliance_id)
    const theirRankData = await getAllianceRankData(attackedAllianceID)
    if (
      !ourRankData ||
      !theirRankData ||
      ourRankData.points > theirRankData.points * 1.2 + 16000 ||
      ourRankData.points < (theirRankData.points - 16000) / 1.2
    ) {
      res.status(401).json({ error: 'Hay demasiada diferencia en puntos' })
      return
    }

    const activeWarBetweenBoth = await getActiveWarBetweenAlliances(userRank.alliance_id, attackedAllianceID)
    if (activeWarBetweenBoth) {
      res.status(401).json({ error: 'Ya tenéis una guerra activa' })
      return
    }

    const attackedHoods = req.body.hoods.map(n => parseInt(n))
    try {
      await checkHoodsAreValidForWar(attackedHoods, attackedAllianceID)
    } catch (err) {
      res.status(401).json({ error: err.message })
      return
    }

    const alliance2Hoods = attackedHoods.join(',')
    const data = { days: {} }
    const tsNow = Math.floor(Date.now() / 1000)
    const {
      insertId: warID,
    } = await mysql.query(
      'INSERT INTO alliances_wars (created_at, alliance1_id, alliance2_id, data, alliance2_hoods) VALUES (?, ?, ?, ?, ?)',
      [tsNow, userRank.alliance_id, attackedAllianceID, JSON.stringify(data), alliance2Hoods]
    )

    const attackedAllianceMembers = await getAllianceMembers(attackedAllianceID)
    const myAllianceMembers = await getAllianceMembers(userRank.alliance_id)

    await Promise.all(
      [...attackedAllianceMembers, ...myAllianceMembers].map(member =>
        sendMessage({
          receiverID: member.user.id,
          senderID: null,
          type: 'war_started',
          data: { war_id: warID },
        })
      )
    )

    res.json({ success: true })
  })

  app.post('/v1/alliance/choose_war_hoods', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const warID = parseInt(req.body.war_id)
    const attackedHoods = req.body.hoods.map(n => parseInt(n))

    const userRank = await getUserAllianceRank(req.userData.id)
    if (!userRank || !userRank.permission_declare_war) {
      res.status(401).json({ error: 'No tienes permiso para hacer esto' })
      return
    }

    const warData = await getWarData(warID)
    if (!warData) {
      res.status(401).json({ error: 'Guerra no encontrada' })
      return
    }

    if (warData.alliance1.id === userRank.alliance_id) {
      res.status(401).json({ error: 'Solo pueden elegir barrios los defensores' })
      return
    }

    if (warData.alliance1_hoods.length > 0) {
      res.status(401).json({ error: 'Ya has elegido barrios' })
      return
    }

    try {
      await checkHoodsAreValidForWar(attackedHoods, warData.alliance1.id)
    } catch (err) {
      res.status(401).json({ error: err.message })
      return
    }

    const alliance1Hoods = attackedHoods.join(',')
    await mysql.query('UPDATE alliances_wars SET alliance1_hoods=? WHERE id=?', [alliance1Hoods, warID])

    res.json({ success: true })
  })
}

async function checkHoodsAreValidForWar(attackedHoods, enemyAllianceID) {
  // Check hoods param is valid and hoods exist
  if (!Array.isArray(attackedHoods) || attackedHoods.length === 0) {
    throw new Error('Barrios inválidos')
  }

  const areHoodsFromAlliance = (
    await Promise.all(
      attackedHoods.map(async hoodID => {
        const hoodData = await getHoodData(hoodID)
        return hoodData && hoodData.owner && hoodData.owner.id === enemyAllianceID
      })
    )
  ).every(Boolean)
  if (!areHoodsFromAlliance) {
    throw new Error('Barrios inválidos')
  }

  // Check if hoods are already in war
  const anyHoodInWar = (await Promise.all(attackedHoods.map(isHoodInWar))).some(Boolean)
  if (anyHoodInWar) {
    throw new Error('Algún barrio ya está en guerra')
  }

  // Check if it's equal or less to hoods limit per war
  const maxHoods = getMaxHoodsAttackedPerWar(getServerDay())
  if (attackedHoods.length > maxHoods) {
    throw new Error(`Has seleccionado más barrios de los permitidos (${maxHoods})`)
  }
}

export async function isHoodInWar(hoodID) {
  const likeStr = `%${hoodID}%`
  const wars = await mysql.query(
    'SELECT alliance1_hoods, alliance2_hoods FROM alliances_wars WHERE completed=0 AND (alliance1_hoods LIKE ? OR alliance2_hoods LIKE ?)',
    [likeStr, likeStr]
  )

  for (const war of wars) {
    const warHoods = [...(war.alliance1_hoods || '').split(','), ...(war.alliance2_hoods || '').split(',')]
      .filter(str => str.length > 0)
      .map(hood => parseInt(hood))

    if (warHoods.some(h => h === hoodID)) {
      return true
    }
  }
  return false
}
