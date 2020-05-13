export const timestampFromEpoch = epoch => {
  epoch *= 1000
  const date = new Date(epoch)
  return `[${date.toLocaleString()}]`
}

export const msToDisplay = ms => {
  ms *= 1000
  // const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}:${seconds}`
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
export function getContestRewards(position) {
  const reward = contestRewardsMap.find(item => item.rankNeeded >= position)
  return reward
}
