import { giveXPToUser, giveGoldToUser } from '../../../lib/db/users'
import { increaseUserStat } from '../../../lib/db/stats'

type EventDataWarEnded = {
  alliance1UserIDs: number[]
  alliance2UserIDs: number[]
  winner: number
  mvpPlayer: number
}
export default async function hookWarEnded(data: EventDataWarEnded): Promise<void> {
  const winnerUserIDs = data.winner === 1 ? data.alliance1UserIDs : data.alliance2UserIDs
  const loserUserIDs = data.winner === 1 ? data.alliance1UserIDs : data.alliance2UserIDs

  await Promise.all([
    Promise.all(
      winnerUserIDs.map(uID => {
        return Promise.all([giveXPToUser(uID, 40), giveGoldToUser(uID, 100), increaseUserStat(uID, 'war_win', 1)])
      })
    ),
    Promise.all(
      loserUserIDs.map(uID => {
        return Promise.all([giveXPToUser(uID, 10), increaseUserStat(uID, 'war_lose', 1)])
      })
    ),
    increaseUserStat(data.mvpPlayer, 'war_mvp', 1),
  ])
}
