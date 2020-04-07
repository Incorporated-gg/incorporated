import React, { useCallback, useState, useEffect } from 'react'
import { MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { reloadUserData } from 'lib/user'
import cardStyles from 'components/card/card.module.scss'
import api from 'lib/api'

UpgradeInstantlyButton.propTypes = {
  researchID: PropTypes.number.isRequired,
  finishesAt: PropTypes.number.isRequired,
}
export default function UpgradeInstantlyButton({ researchID, finishesAt }) {
  const [, _reload] = useState({})
  useEffect(() => {
    const int = setInterval(() => _reload({}), 1000)
    return () => clearInterval(int)
  }, [finishesAt])

  const manuallyFinishResearch = useCallback(() => {
    api
      .post('/v1/research/manually_finish', { research_id: researchID })
      .then(() => {
        reloadUserData()
      })
      .catch(err => alert(err.message))
  }, [researchID])

  const secondsLeft = finishesAt - Math.floor(Date.now() / 1000)
  if (secondsLeft > MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS) return null

  return (
    <button className={`${cardStyles.button}`} onClick={manuallyFinishResearch} disabled={false}>
      TERMINAR MEJORA
    </button>
  )
}
