import mysql from '../mysql'

function checkStatMoreOrEqualThan(statID: string, requirement: number) {
  return async (userID: number): Promise<boolean> => {
    const getAttacksStat = await mysql.selectOne('SELECT value FROM users_stats WHERE user_id=? AND stat_id=?', [
      userID,
      statID,
    ])
    if (!getAttacksStat) return false
    return getAttacksStat.value >= requirement
  }
}

export const achievements = [
  {
    id: 'attack_1_time',
    statDependencies: ['attacks_win'],
    check: checkStatMoreOrEqualThan('attacks_win', 1),
  },
  {
    id: 'attack_10_times',
    statDependencies: ['attacks_win'],
    check: checkStatMoreOrEqualThan('attacks_win', 10),
  },
  {
    id: 'attack_50_times',
    statDependencies: ['attacks_win'],
    check: checkStatMoreOrEqualThan('attacks_win', 100),
  },
  {
    id: 'rob_100k',
    statDependencies: ['robbed_money'],
    check: checkStatMoreOrEqualThan('robbed_money', 100000),
  },
  {
    id: 'rob_100M',
    statDependencies: ['robbed_money'],
    check: checkStatMoreOrEqualThan('robbed_money', 100000000),
  },
  {
    id: 'smack_1_time',
    statDependencies: ['defenses_win'],
    check: checkStatMoreOrEqualThan('defenses_win', 1),
  },
  {
    id: 'smack_10_times',
    statDependencies: ['defenses_win'],
    check: checkStatMoreOrEqualThan('defenses_win', 10),
  },
  {
    id: 'win_1_war',
    statDependencies: ['war_win'],
    check: checkStatMoreOrEqualThan('war_win', 1),
  },
  {
    id: 'win_10_wars',
    statDependencies: ['war_win'],
    check: checkStatMoreOrEqualThan('war_win', 10),
  },
  {
    id: 'be_war_mvp',
    statDependencies: ['war_mvp'],
    check: checkStatMoreOrEqualThan('war_mvp', 1),
  },
]
