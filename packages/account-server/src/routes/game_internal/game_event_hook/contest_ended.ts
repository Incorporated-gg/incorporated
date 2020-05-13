import { giveGoldToUser, giveXPToUser } from '../../../lib/db/users'
import { getContestRewards } from 'shared-lib/commonUtils'

console.log(getContestRewards(2))

type EventDataContestEnded = {
  contestName: string
  orderedWinnerIDs: number[]
}
export default async function hookContestEnded(data: EventDataContestEnded): Promise<void> {
  switch (data.contestName) {
    case 'monopolies': {
      await Promise.all(
        data.orderedWinnerIDs.map(userID => {
          return Promise.all([giveGoldToUser(userID, 100), giveXPToUser(userID, 20)])
        })
      )
      break
    }
    case 'income':
    case 'destruction':
    case 'research':
    case 'robbing': {
      await Promise.all(
        data.orderedWinnerIDs.map(async (userID, rankIndex) => {
          const rank = rankIndex + 1
          const reward = getContestRewards(rank)
          if (!reward) throw new Error(`Invalid rank ${rank} has no reward`)
          await Promise.all([giveGoldToUser(userID, reward.gold), giveXPToUser(userID, reward.xp)])
        })
      )
      break
    }
    default: {
      throw new Error(`Unknown contestType ${data.contestName}`)
    }
  }
}
