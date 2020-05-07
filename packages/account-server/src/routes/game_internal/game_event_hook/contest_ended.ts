import { giveGoldToUser, giveXPToUser } from '../../../lib/db/users'

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
      const rewardsMap = [
        { rankNeeded: 1, gold: 250, xp: 50 },
        { rankNeeded: 2, gold: 150, xp: 30 },
        { rankNeeded: 3, gold: 110, xp: 22 },
        { rankNeeded: 10, gold: 70, xp: 14 },
        { rankNeeded: 25, gold: 40, xp: 8 },
        { rankNeeded: 50, gold: 20, xp: 4 },
        { rankNeeded: 100, gold: 10, xp: 2 },
      ]
      await Promise.all(
        data.orderedWinnerIDs.map(async (userID, rankIndex) => {
          const rank = rankIndex + 1
          const reward = rewardsMap.find(item => item.rankNeeded >= rank)
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
