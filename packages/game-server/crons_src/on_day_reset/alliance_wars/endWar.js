import mysql from '../../../src/lib/mysql'
import { getAllianceMembers } from '../../../src/lib/db/alliances'
import { sendAccountHook } from '../../../src/lib/accountInternalApi'
import { sendMessage } from '../../../src/lib/db/users'
import { getServerDay, getInitialUnixTimestampOfServerDay } from '../../../src/lib/serverTime'
import { changeHoodsOwner } from '../../../src/lib/db/hoods'

const EXTRA_POINTS_PER_OBJECTIVE = 40

async function getAttacksFromUsers({ userIDs, attackedUserIDs, minTs, maxTs }) {
  if (!attackedUserIDs.length || !userIDs.length) return []

  const attacks = await mysql.query(
    'SELECT user_id, target_user, result, profit, data FROM missions WHERE mission_type="attack" AND completed=1 AND will_finish_at>=? AND will_finish_at<? AND user_id IN (?) AND target_user IN (?)',
    [minTs, maxTs, userIDs, attackedUserIDs]
  )
  return attacks.map(attack => {
    attack.data = JSON.parse(attack.data)
    return attack
  })
}

export async function endWar(warData) {
  const alliance1UserIDs = (await getAllianceMembers(warData.alliance1.id)).map(m => m.user.id)
  const alliance2UserIDs = (await getAllianceMembers(warData.alliance2.id)).map(m => m.user.id)

  const days = Object.values(warData._data.days)

  let warPointsAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.war_points, 0)
  let warPointsAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.war_points, 0)

  // Extra points
  const attackWinsAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.attack_wins, 0)
  const attackWinsAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.attack_wins, 0)
  if (attackWinsAlliance1 !== attackWinsAlliance2) {
    if (attackWinsAlliance1 > attackWinsAlliance2) warPointsAlliance1 += EXTRA_POINTS_PER_OBJECTIVE
    else warPointsAlliance2 += EXTRA_POINTS_PER_OBJECTIVE
  }
  const profitAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.profit, 0)
  const profitAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.profit, 0)
  if (profitAlliance1 !== profitAlliance2) {
    if (profitAlliance1 > profitAlliance2) warPointsAlliance1 += EXTRA_POINTS_PER_OBJECTIVE
    else warPointsAlliance2 += EXTRA_POINTS_PER_OBJECTIVE
  }
  const attackSmacksAlliance1 = days.reduce((prev, curr) => prev + curr.alliance1.attack_smacks, 0)
  const attackSmacksAlliance2 = days.reduce((prev, curr) => prev + curr.alliance2.attack_smacks, 0)
  if (attackSmacksAlliance1 !== attackSmacksAlliance2) {
    if (attackSmacksAlliance1 > attackSmacksAlliance2) warPointsAlliance1 += EXTRA_POINTS_PER_OBJECTIVE
    else warPointsAlliance2 += EXTRA_POINTS_PER_OBJECTIVE
  }

  const winner = warPointsAlliance1 > warPointsAlliance2 ? 1 : 2
  warData._data.winner = winner

  if (winner === 1) {
    // The attacker won. Change hoods owner
    const hoodIDs = warData.alliance2_hoods.map(hood => hood.id)
    await changeHoodsOwner(hoodIDs, warData.alliance1.id)
  } else {
    // The defensor won. Change hoods owner
    const hoodIDs = warData.alliance2_hoods.map(hood => hood.id)
    await changeHoodsOwner(hoodIDs, warData.alliance1.id)
  }

  await mysql.query('UPDATE alliances_wars SET completed=1, data=? WHERE id=?', [
    JSON.stringify(warData._data),
    warData.id,
  ])
  await Promise.all(
    [...alliance1UserIDs, ...alliance2UserIDs].map(userID =>
      sendMessage({
        receiverID: userID,
        senderID: null,
        type: 'war_ended',
        data: { war_id: warData.id },
      })
    )
  )

  // Account hook
  sendAccountHook('war_ended', {
    winner,
    alliance1UserIDs,
    alliance2UserIDs,
    mvpPlayer: await getMvpPlayerFromWar(warData.created_at, alliance1UserIDs, alliance2UserIDs),
  })
}

async function getMvpPlayerFromWar(warCreatedAtTimestamp, alliance1UserIDs, alliance2UserIDs) {
  const firstTsOfWar = getInitialUnixTimestampOfServerDay(getServerDay(warCreatedAtTimestamp * 1000)) / 1000
  const tsNow = Math.floor(Date.now() / 1000)

  const allWarAttacks = [
    ...(await getAttacksFromUsers({
      userIDs: alliance1UserIDs,
      attackedUserIDs: alliance2UserIDs,
      minTs: firstTsOfWar,
      maxTs: tsNow,
    })),
    ...(await getAttacksFromUsers({
      userIDs: alliance2UserIDs,
      attackedUserIDs: alliance1UserIDs,
      minTs: firstTsOfWar,
      maxTs: tsNow,
    })),
  ]

  const usersTotalIncomeByID = {}

  allWarAttacks.forEach(attack => {
    if (!usersTotalIncomeByID[attack.user_id]) usersTotalIncomeByID[attack.user_id] = 0

    usersTotalIncomeByID[attack.user_id] += attack.data.report.attacker_total_income
  })

  const mvp = Object.entries(usersTotalIncomeByID).sort((a, b) => {
    return a[1] > b[1] ? -1 : 1
  })

  if (!mvp.length) return null
  return parseInt(mvp[0][0])
}
