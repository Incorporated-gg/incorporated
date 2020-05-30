import mysql from '../../lib/mysql'
import {
  getAllianceBasicData,
  getUserAllianceRank,
  getActiveWarBetweenAlliances,
  getAllianceRankData,
  getAllianceMembers,
} from '../../lib/db/alliances'
import { sendMessage } from '../../lib/db/users'

module.exports = app => {
  app.post('/v1/alliance/declare_war', async function(req, res) {
    const disabled = true
    if (disabled) {
      res.status(401).json({ error: 'Guerras desactivadas (por ahora)' })
      return
    }

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
    if (!userRank || !userRank.permission_admin) {
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

    const data = { days: {} }
    const tsNow = Math.floor(Date.now() / 1000)
    const {
      insertId: warID,
    } = await mysql.query(
      'INSERT INTO alliances_wars (created_at, alliance1_id, alliance2_id, data) VALUES (?, ?, ?, ?)',
      [tsNow, userRank.alliance_id, attackedAllianceID, JSON.stringify(data)]
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
