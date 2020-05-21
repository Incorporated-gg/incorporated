import mysql from '../../src/lib/mysql'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { getServerDate, getInitialUnixTimestampOfServerDay } from '../../src/lib/serverTime'
import { sendAccountHook } from '../../src/lib/accountInternalApi'

export default async function monopolies(willFinishServerDay) {
  const serverDate = getServerDate(getInitialUnixTimestampOfServerDay(willFinishServerDay))
  if (serverDate.day_of_the_week !== 6) return

  // Update monopolies table
  await Promise.all(
    buildingsList.map(async ({ id: buildingID }) => {
      const [
        monopolyHolder,
      ] = await mysql.query('SELECT user_id, quantity FROM buildings WHERE id=? ORDER BY quantity DESC LIMIT 1', [
        buildingID,
      ])
      if (!monopolyHolder) return

      const [doesMonopolyRowExist] = await mysql.query('SELECT 1 FROM monopolies WHERE building_id=?', [buildingID])
      if (!doesMonopolyRowExist) {
        await mysql.query('INSERT INTO monopolies (building_id, user_id, building_quantity) VALUES (?, ?, ?)', [
          buildingID,
          monopolyHolder.user_id,
          monopolyHolder.quantity,
        ])
      } else {
        await mysql.query('UPDATE monopolies SET user_id=?, building_quantity=? WHERE building_id=?', [
          monopolyHolder.user_id,
          monopolyHolder.quantity,
          buildingID,
        ])
      }
    })
  )

  // Send monopolies reward
  const messagesCreatedAt = Math.floor(Date.now() / 1000)
  const monopolyHolders = await mysql.query(
    'SELECT building_id, user_id, building_quantity FROM monopolies ORDER BY building_id ASC'
  )
  await Promise.all(
    monopolyHolders.map(async monopoly => {
      await mysql.query('INSERT INTO messages (user_id, sender_id, created_at, type, data) VALUES (?, ?, ?, ?, ?)', [
        monopoly.user_id,
        null,
        messagesCreatedAt,
        'monopoly_reward',
        JSON.stringify({
          building_id: monopoly.building_id,
          building_quantity: monopoly.building_quantity,
        }),
      ])
    })
  )

  sendAccountHook('contest_ended', {
    contestName: 'monopolies',
    orderedWinnerIDs: monopolyHolders.map(rank => rank.user_id),
  })
}
