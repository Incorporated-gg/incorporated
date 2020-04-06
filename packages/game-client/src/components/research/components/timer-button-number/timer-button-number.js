import React, { useState, useEffect } from 'react'
import { calcResearchSecondsDuration } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { reloadUserData } from 'lib/user'
import { getTimeUntil, throttle } from 'lib/utils'
import cardStyles from 'components/card/card.module.scss'
import Container from 'components/UI/container'

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
  let progress = 0

  let text
  if (skipResearchDuration) {
    text = '00:00' // Hack needed since getTimeUntil will return Completando... if <= 0
  } else if (!isUpgrading) {
    const researchTimeParsed = getTimeUntil(tsNow + researchSeconds, true)
    text = researchTimeParsed
  } else if (tsNow > finishesAt) {
    throttledReloadUserData()
    text = <>Completando...</>
    progress = 100
  } else {
    const timeLeft = getTimeUntil(finishesAt, true)
    text = <>Investigando... {timeLeft}</>
    const initialTs = finishesAt - researchSeconds
    const secondsElapsed = tsNow - initialTs
    progress = (secondsElapsed / researchSeconds) * 100
  }

  return (
    <Container outerClassName={cardStyles.button}>
      <div className={cardStyles.buttonNumberContainer}>
        <div className={cardStyles.buttonNumberProgress} style={{ width: progress + '%' }} />
        <div className={cardStyles.buttonNumberText}>{text}</div>
      </div>
    </Container>
  )
}
const throttledReloadUserData = throttle(reloadUserData, 2000)
