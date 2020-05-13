type ContestReward = {
  rankNeeded: number
  gold: number
  xp: number
}

export function getContestRewards(position: number): ContestReward
