import { calcSpiesPower, calcSpionageDefensePower, calcSpyFailProbabilities } from 'shared-lib/missionsUtils'

export function calcSpiesCaptured({ resLvlAttacker, resLvLDefender, spiesSent }) {
  const failProbability = calcSpyFailProbabilities({ resLvlAttacker, resLvLDefender, spiesSent }).total / 100

  const randomNum = Math.random()
  const caught = randomNum < failProbability
  let spiesCaptured = 0
  if (caught) {
    const randomPart = Math.random() * 1 + 0.5
    spiesCaptured = Math.ceil(randomPart * failProbability * spiesSent)
    spiesCaptured = Math.min(spiesSent, spiesCaptured)
  }

  return spiesCaptured
}

export function calcInformationPercentageObtained({ resLvlAttacker, resLvLDefender, spiesRemaining }) {
  const defensePower = calcSpionageDefensePower(resLvLDefender)
  const attackPower = calcSpiesPower(resLvlAttacker) * spiesRemaining

  const randomPercentage = Math.random() * 20 - 10
  const powerPercentage = (attackPower / defensePower) * 100
  const obtainedInformationPercentage = powerPercentage + randomPercentage

  return Math.floor(obtainedInformationPercentage * 100) / 100
}
