export function calcHoodUpgradePrice(hoodLevel) {
  return 40000 * (hoodLevel + 2)
}

export function calcHoodMaxGuards(hoodLevel) {
  return 3000 + 200 * (hoodLevel + 0.5 * hoodLevel * (hoodLevel + 1))
}

export function calcHoodGuardsRegenerationPerDay(hoodLevel) {
  return calcHoodMaxGuards(hoodLevel)
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
