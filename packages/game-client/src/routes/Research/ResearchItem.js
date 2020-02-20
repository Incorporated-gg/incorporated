import React, { useCallback, useState, useEffect } from 'react'
import {
  researchList,
  calcResearchPrice,
  calcResearchTime,
  MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS,
} from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { useUserData, reloadUserData } from 'lib/user'
import { getTimeUntil, throttle } from 'lib/utils'
import { buyResearch } from './buyResearch'
import Card from 'components/card'
import Stat from 'components/stat'
import cardStyles from 'components/card/card.module.scss'
import { post } from 'lib/api'

const researchImages = {
  1: require('./img/spy.png'),
  2: require('./img/attack.png'),
  3: require('./img/defense.png'),
  4: require('./img/bank.png'),
  6: require('./img/security.png'),
}
const researchDescriptions = {
  1: `Mejora tus espías`,
  2: `Mejora tus saboteadores y ladrones`,
  3: `Mejora tus guardias`,
  4: `Mejora el maximo dinero almacenado en tus edificios`,
  6: `Mejora la defensa intrínsica de tus edificios`,
}

ResearchItem.propTypes = {
  researchID: PropTypes.number.isRequired,
}
export default function ResearchItem({ researchID }) {
  const userData = useUserData()
  const isUpgrading = userData.activeResearchs.find(ar => ar.research_id === researchID)
  const research = researchList.find(r => r.id === researchID)
  const level = userData.researchs[researchID]
  const researchTime = calcResearchTime(researchID, level)
  const researchTimeParsed = getTimeUntil(Date.now() / 1000 + researchTime, true)
  const cost = Math.ceil(calcResearchPrice(research.id, level + (isUpgrading ? 1 : 0)))
  const canAfford = userData.money > cost
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])

  return (
    <Card
      cost={cost.toLocaleString()}
      title={research.name}
      ribbon={`Lvl. ${level.toLocaleString()}`}
      desc={researchDescriptions[researchID]}
      image={researchImages[researchID]}>
      <Stat img={require('./img/stat-price.png')} title={'Coste'} value={`${cost.toLocaleString()}€`} />
      <p style={{ color: '#fff' }}>
        {isUpgrading ? (
          <UpgradingTimer finishesAt={isUpgrading.finishes_at} />
        ) : (
          <>Duración de mejora: {researchTimeParsed}</>
        )}
      </p>

      {isUpgrading && <UpgradeInstantlyButton finishesAt={isUpgrading.finishes_at} researchID={researchID} />}
      <button className={cardStyles.button} onClick={buyResearchClicked} disabled={!canAfford || isUpgrading}>
        MEJORAR
      </button>
    </Card>
  )
}

UpgradingTimer.propTypes = {
  finishesAt: PropTypes.number.isRequired,
}
function UpgradingTimer({ finishesAt }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(finishesAt, true))
  useEffect(() => {
    const int = setInterval(() => setTimeLeft(getTimeUntil(finishesAt, true)), 1000)
    return () => clearInterval(int)
  }, [finishesAt])

  if (Date.now() / 1000 > finishesAt) {
    throttledReloadUserData()
    return <>Completando...</>
  }
  return <>Investigando... {timeLeft}</>
}
const throttledReloadUserData = throttle(reloadUserData, 2000)

UpgradeInstantlyButton.propTypes = {
  researchID: PropTypes.number.isRequired,
  finishesAt: PropTypes.number.isRequired,
}
function UpgradeInstantlyButton({ researchID, finishesAt }) {
  const [, _reload] = useState({})
  useEffect(() => {
    const int = setInterval(() => _reload({}), 1000)
    return () => clearInterval(int)
  }, [finishesAt])

  const manuallyFinishResearch = useCallback(() => {
    post('/v1/research/manually_finish', { research_id: researchID })
      .then(() => {
        reloadUserData()
      })
      .catch(err => alert(err.message))
  }, [researchID])

  const secondsLeft = finishesAt - Math.floor(Date.now() / 1000)
  if (secondsLeft > MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS) return null

  return (
    <button className={cardStyles.button} onClick={manuallyFinishResearch} disabled={false}>
      TERMINAR MEJORA
    </button>
  )
}
