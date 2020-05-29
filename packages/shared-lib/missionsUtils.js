import { PERSONNEL_OBJ } from './personnelUtils'

export const NEWBIE_ZONE_DAILY_INCOME = 750000
export const MAX_ACCUMULATED_ATTACKS = 6

export function calculateIsInAttackRange(attackerDailyIncome, defenderDailyIncome) {
  if (process.env.NODE_ENV === 'development') return true
  if (attackerDailyIncome < NEWBIE_ZONE_DAILY_INCOME || defenderDailyIncome < NEWBIE_ZONE_DAILY_INCOME) return false

  const maxIncome = attackerDailyIncome * 1.2 + 2000000
  const minIncome = (attackerDailyIncome - 2000000) / 1.2
  return defenderDailyIncome >= minIncome && defenderDailyIncome <= maxIncome
}

export function calculateMaxDailyReceivedAttacks(dailyIncome) {
  if (dailyIncome < 2e6) return 3
  if (dailyIncome < 4e6) return 4
  if (dailyIncome < 8e6) return 5
  return 6 + Math.ceil((dailyIncome - 15e6) / 10e6)
}

export function calculateMissionTime(missionType) {
  if (missionType === 'attack') return process.env.NODE_ENV === 'development' ? 5 : 300
  if (missionType === 'spy') return process.env.NODE_ENV === 'development' ? 5 : 60
  return 0
}

export function calcSabotsPower(sabotageResearchLvl) {
  return PERSONNEL_OBJ.sabots.combatPower * sabotageResearchLvl
}
export function calcThievesPower(sabotageResearchLvl) {
  return PERSONNEL_OBJ.thieves.combatPower * sabotageResearchLvl
}
export function calcGuardsPower(securityResearchLvl) {
  return PERSONNEL_OBJ.guards.combatPower * securityResearchLvl
}

export function calcSpiesPower(spyResearchLvl) {
  return 2 * spyResearchLvl
}
function calcSpionageDefensePower(spyResearchLvl) {
  return 5 * Math.pow(spyResearchLvl, 2.2)
}

export function calcSpyFailProbabilities({ resLvlAttacker, resLvLDefender, spiesSent }) {
  let spiesProbability = (4 * spiesSent) / resLvlAttacker
  spiesProbability = Math.min(100, Math.max(0, spiesProbability))

  let lvlProbability = 5 + (4 + Math.max(resLvLDefender, resLvlAttacker) / 4) * (resLvLDefender - resLvlAttacker)
  lvlProbability = Math.min(100, Math.max(-999, lvlProbability))

  return {
    spies: spiesProbability,
    level: lvlProbability,
    total: Math.min(100, Math.max(0, spiesProbability + lvlProbability)),
  }
}

export function calcSpyInformationPercentageRange({ resLvlAttacker, resLvLDefender, spiesRemaining }) {
  const defensePower = calcSpionageDefensePower(resLvLDefender)
  const attackPower = calcSpiesPower(resLvlAttacker) * spiesRemaining

  const randomPercentage = { min: -10, max: 10 }
  const powerPercentage = (attackPower / defensePower) * 100

  return {
    min: Math.max(0, Math.min(100, powerPercentage + randomPercentage.min)),
    max: Math.max(0, Math.min(100, powerPercentage + randomPercentage.max)),
  }
}
