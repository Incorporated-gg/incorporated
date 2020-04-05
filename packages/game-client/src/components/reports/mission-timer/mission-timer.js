import React, { useState, useEffect } from 'react'
import { getTimeUntil, throttle } from 'lib/utils'
import PropTypes from 'prop-types'
import { updateTabTitle } from 'lib/tabTitle'
import { reloadUserData } from 'lib/user'

MissionTimer.propTypes = {
  finishesAt: PropTypes.number.isRequired,
  isMyMission: PropTypes.bool.isRequired,
}
export default function MissionTimer({ finishesAt, isMyMission }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(finishesAt, true))
  useEffect(() => {
    const int = setInterval(() => setTimeLeft(getTimeUntil(finishesAt, true)), 1000)
    return () => clearInterval(int)
  }, [finishesAt])

  if (isMyMission) {
    updateTabTitle({ missionTimeLeft: timeLeft })
  }

  if (Date.now() / 1000 > finishesAt) {
    throttledReloadUserData()
  }
  return <>{timeLeft}</>
}
const throttledReloadUserData = throttle(reloadUserData, 2000)
