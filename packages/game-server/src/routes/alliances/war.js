import mysql from '../../lib/mysql'
import {
  getAllianceBasicData,
  getUserAllianceRank,
  getAllianceRankData,
  getAllianceMembers,
} from '../../lib/db/alliances'
import { sendMessage } from '../../lib/db/users'
import { getActiveWarIDBetweenAlliances } from '../../lib/db/alliances/war'

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

    const activeWarBetweenBoth = await getActiveWarIDBetweenAlliances(userRank.alliance_id, attackedAllianceID)
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
