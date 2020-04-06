import { giveXPToUser, giveGoldToUser } from '../../../lib/db/users'

type EventDataWarEnded = {
  alliance1UserIDs: number[]
  alliance2UserIDs: number[]
  winner: number
}
export default async function hookWarEnded(data: EventDataWarEnded): Promise<void> {
  const winnerUserIDs = data.winner === 1 ? data.alliance1UserIDs : data.alliance2UserIDs
  const loserUserIDs = data.winner === 1 ? data.alliance1UserIDs : data.alliance2UserIDs

  await Promise.all([
    Promise.all(
      winnerUserIDs.map(uID => {
        return Promise.all([giveXPToUser(uID, 40), giveGoldToUser(uID, 100)])
      })
    ),
    Promise.all(
      loserUserIDs.map(uID => {
        return giveXPToUser(uID, 10)
      })
    ),
  ])
}
