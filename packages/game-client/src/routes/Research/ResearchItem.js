import React, { useCallback, useState, useEffect } from 'react'
import {
  researchList,
  calcResearchPrice,
  calcResearchSecondsDuration,
  MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS,
} from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { useUserData, reloadUserData } from 'lib/user'
import { getTimeUntil, throttle, numberToAbbreviation } from 'lib/utils'
import { buyResearch } from './buyResearch'
import Card from 'components/card'
import cardStyles from 'components/card/card.module.scss'
import { post } from 'lib/api'
import Container from 'components/UI/container'
import Icon from 'components/icon'
import styles from './research-item.module.scss'

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
  const upgrade = userData.activeResearchs.find(ar => ar.research_id === researchID)
  const research = researchList.find(r => r.id === researchID)
  const level = userData.researchs[researchID]
  const cost = Math.ceil(calcResearchPrice(research.id, level + (upgrade ? 1 : 0)))
  const canAfford = userData.money > cost
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])

  return (
    <Card
      cost={cost.toLocaleString()}
      title={research.name}
      ribbon={`Lvl. ${level.toLocaleString()}`}
      desc={researchDescriptions[researchID]}
      image={researchImages[researchID]}>
      <TimerButtonNumber
        finishesAt={upgrade && upgrade.finishes_at}
        researchID={researchID}
        level={level}
        isUpgrading={!!upgrade}
      />

      {upgrade && <UpgradeInstantlyButton finishesAt={upgrade.finishes_at} researchID={researchID} />}

      <Container outerClassName={cardStyles.button} onClick={buyResearchClicked} disabled={!canAfford || !!upgrade}>
        <div className={cardStyles.buttonNumberContainer}>
          <div className={cardStyles.buttonNumberText}>
            {numberToAbbreviation(cost)} <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
          </div>
        </div>
        <h2 className={styles.researchButton}>{'INVESTIGAR'}</h2>
      </Container>
    </Card>
  )
}

TimerButtonNumber.propTypes = {
  finishesAt: PropTypes.number,
  researchID: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  isUpgrading: PropTypes.bool.isRequired,
}
function TimerButtonNumber({ finishesAt, researchID, level, isUpgrading }) {
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
  if (!isUpgrading) {
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
    <button className={`${cardStyles.button}`} onClick={manuallyFinishResearch} disabled={false}>
      TERMINAR MEJORA
    </button>
  )
}
