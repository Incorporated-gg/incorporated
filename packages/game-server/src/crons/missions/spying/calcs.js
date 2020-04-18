import { calcSendableSpies, calcSpyFailProbabilities } from 'shared-lib/missionsUtils'

export function calcSpiesCaptured({ resLvlAttacker, resLvLDefender, spiesSent }) {
  const failProbability = calcSpyFailProbabilities({ resLvlAttacker, resLvLDefender, spiesSent }).total

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

export function _calcInformationObtainedProbabilities({ resLvLDefender, spiesRemaining }) {
  const neededSpies = calcSendableSpies(resLvLDefender)
  const sentSpiesPercentage = spiesRemaining / neededSpies

  const MINIMUM_FOR_RESEARCH = 1
  const MINIMUM_FOR_PERSONNEL = 0.66
  const MINIMUM_FOR_BUILDINGS = 0.33

  const spiesSectionRelation =
    sentSpiesPercentage < MINIMUM_FOR_BUILDINGS
      ? sentSpiesPercentage / MINIMUM_FOR_BUILDINGS
      : sentSpiesPercentage < MINIMUM_FOR_PERSONNEL
      ? (sentSpiesPercentage - MINIMUM_FOR_BUILDINGS) / MINIMUM_FOR_BUILDINGS
      : sentSpiesPercentage < MINIMUM_FOR_RESEARCH
      ? (sentSpiesPercentage - MINIMUM_FOR_PERSONNEL) / MINIMUM_FOR_BUILDINGS
      : MINIMUM_FOR_RESEARCH

  const maxInfo =
    sentSpiesPercentage < MINIMUM_FOR_BUILDINGS
      ? 'buildings'
      : sentSpiesPercentage < MINIMUM_FOR_PERSONNEL
      ? 'personnel'
      : 'research'
  const minInfo =
    sentSpiesPercentage < MINIMUM_FOR_BUILDINGS
      ? 'nothing'
      : sentSpiesPercentage < MINIMUM_FOR_PERSONNEL
      ? 'buildings'
      : 'personnel'

  const maxInfoProb = spiesSectionRelation
  return {
    maxInfo,
    minInfo,
    maxInfoProb,
  }
}

export function calcInformationObtained({ resLvLDefender, spiesRemaining }) {
  const { maxInfo, minInfo, maxInfoProb } = _calcInformationObtainedProbabilities({ resLvLDefender, spiesRemaining })
  const randomNum = Math.random()
  const infoObtained = randomNum < maxInfoProb ? maxInfo : minInfo
  return {
    buildings: infoObtained === 'buildings' || infoObtained === 'personnel' || infoObtained === 'research',
    personnel: infoObtained === 'personnel' || infoObtained === 'research',
    research: infoObtained === 'research',
  }
}
