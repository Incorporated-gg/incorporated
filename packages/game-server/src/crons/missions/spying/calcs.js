import { calcSpyFailProbabilities, calcSpyInformationPercentageRange } from 'shared-lib/missionsUtils'

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
  const range = calcSpyInformationPercentageRange({ resLvlAttacker, resLvLDefender, spiesRemaining })

  const result = Math.random() * 100 * (range.max - range.min) + range.min

  return Math.floor(result * 100) / 100
}
