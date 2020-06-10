interface ContestReward {
  rankNeeded: number
  gold: number
  xp: number
}

const contestRewardsMap = [
  { rankNeeded: 1, gold: 250, xp: 50 },
  { rankNeeded: 2, gold: 150, xp: 30 },
  { rankNeeded: 3, gold: 110, xp: 22 },
  { rankNeeded: 10, gold: 70, xp: 14 },
  { rankNeeded: 25, gold: 40, xp: 8 },
  { rankNeeded: 50, gold: 20, xp: 4 },
  { rankNeeded: 100, gold: 10, xp: 2 },
]
export function getContestRewards(contestID: string, position: number): ContestReward {
  if (contestID === 'monopolies')
    return {
      rankNeeded: 0,
      gold: 100,
      xp: 20,
    }

  const reward = contestRewardsMap.find(item => item.rankNeeded >= position)
  return reward
}
