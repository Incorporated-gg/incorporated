import { reloadUserData } from 'lib/user'
import { throttle, getTimeUntil } from 'lib/utils'

export default function getRemainingTimeText({ skipResearchDuration, researchSeconds, isUpgrading, finishesAt }) {
  const tsNow = Math.floor(Date.now() / 1000)

  if (skipResearchDuration) {
    return '00:00' // Hack needed since getTimeUntil will return Completando... if <= 0
  }
  if (!isUpgrading) {
    const researchTimeParsed = getTimeUntil(tsNow + researchSeconds, true)
    return researchTimeParsed
  }
  if (tsNow > finishesAt) {
    throttledReloadUserData()
    return 'Completando...'
  }

  const timeLeft = getTimeUntil(finishesAt, true)
  return timeLeft
}
const throttledReloadUserData = throttle(reloadUserData, 2000)
