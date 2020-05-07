import { giveXPToUser } from '../../../lib/db/users'
import { increaseUserStat } from '../../../lib/db/stats'

type EventDataWarEnded = {
  alliance1UserIDs: number[]
  alliance2UserIDs: number[]
  winner: number
  mvpPlayer?: number
}

const XP_FOR_WINNING_WAR = 40
const XP_FOR_LOSING_WAR = 10
export default async function hookWarEnded(data: EventDataWarEnded): Promise<void> {
  const winnerUserIDs = data.winner === 1 ? data.alliance1UserIDs : data.alliance2UserIDs
  const loserUserIDs = data.winner === 1 ? data.alliance1UserIDs : data.alliance2UserIDs

  await Promise.all([
    Promise.all(
      winnerUserIDs.map(uID => {
        return Promise.all([giveXPToUser(uID, XP_FOR_WINNING_WAR), increaseUserStat(uID, 'war_win', 1)])
      })
    ),
    Promise.all(
      loserUserIDs.map(uID => {
        return Promise.all([giveXPToUser(uID, XP_FOR_LOSING_WAR), increaseUserStat(uID, 'war_lose', 1)])
      })
    ),
    data.mvpPlayer ? increaseUserStat(data.mvpPlayer, 'war_mvp', 1) : null,
  ])
}
