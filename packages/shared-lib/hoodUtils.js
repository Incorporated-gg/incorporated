export const HOOD_ATTACK_PROTECTION_TIME = 60 * 60 * 24

export function calcHoodUpgradePrice(hoodLevel) {
  return 40000 * (hoodLevel + 2)
}

export function calcHoodMaxGuards(hoodLevel) {
  return 3000 + 200 * (hoodLevel + 0.5 * hoodLevel * (hoodLevel + 1))
}

export function calcHoodDailyServerPoints(hoodTier) {
  const map = {
    1: 10,
    2: 15,
    3: 20,
    4: 25,
    5: 40,
  }
  return map[hoodTier]
}

export function getHoodBenefitValue(benefit, hoodTier) {
  if (
    benefit === 'alliance_research_sabots' ||
    benefit === 'alliance_research_guards' ||
    benefit === 'alliance_research_thieves'
  ) {
    return hoodTier
  }
  if (benefit === 'extra_income') {
    return hoodTier
  }
  if (
    benefit === 'player_research_security' ||
    benefit === 'player_research_espionage' ||
    benefit === 'player_research_defense'
  ) {
    return hoodTier - 3
  }

  throw new Error('Unknown benefit')
}
