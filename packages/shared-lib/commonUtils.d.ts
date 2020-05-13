type ContestReward = {
  rankNeeded: number
  gold: number
  xp: number
}

export function getContestRewards(contestID: string, position: number): ContestReward
