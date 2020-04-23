import { useState, useEffect } from 'react'
import { calcResearchSecondsDuration } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { reloadUserData } from 'lib/user'
import { getTimeUntil, throttle } from 'lib/utils'

TimerButtonNumber.propTypes = {
  finishesAt: PropTypes.number,
  researchID: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  isUpgrading: PropTypes.bool.isRequired,
  skipResearchDuration: PropTypes.bool.isRequired,
}
export default function TimerButtonNumber({ finishesAt, researchID, level, isUpgrading, skipResearchDuration }) {
  const [, _reload] = useState()

  useEffect(() => {
    if (!isUpgrading) return

    const int = setInterval(() => _reload({}), 1000)
    return () => clearInterval(int)
  }, [isUpgrading])

  const tsNow = Math.floor(Date.now() / 1000)
  const researchSeconds = calcResearchSecondsDuration(researchID, level)

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
