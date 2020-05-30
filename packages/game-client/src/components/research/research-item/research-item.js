import React, { useState, useEffect } from 'react'
import {
  researchList,
  calcResearchPrice,
  calcResearchSecondsDuration,
  MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS,
} from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { useUserData, userData, reloadUserData } from 'lib/user'
import { numberToAbbreviation } from 'lib/utils'
import { buyResearch } from './buyResearch'
import Card from 'components/card'
import Icon from 'components/icon'
import styles from './research-item.module.scss'
import ResearchEffectsInfo from '../research-effects-info/research-effects-info'
import IncButton from 'components/UI/inc-button'
import IncChevron from 'components/UI/inc-chevron'
import IncProgressBar from 'components/UI/inc-progress-bar'
import getRemainingTimeText from './getRemainingTimeText'
import api from 'lib/api'

const researchImages = {
  1: require('./img/spy.png'),
  2: require('./img/attack.png'),
  3: require('./img/defense.png'),
  4: require('./img/bank.png'),
  5: require('./img/central-office.png'),
  6: require('./img/security.png'),
}

ResearchItem.propTypes = {
  researchID: PropTypes.number.isRequired,
}
export default function ResearchItem({ researchID }) {
  useUserData()
  // Misc required information
  const researchInfo = researchList.find(r => r.id === researchID)
  const level = userData.researchs[researchID]
  const researchSeconds = calcResearchSecondsDuration(researchID, level)

  const upgrade = userData.activeResearchs.find(ar => ar.research_id === researchID)
  const isUpgrading = Boolean(upgrade)
  const secondsLeft = !isUpgrading ? Infinity : upgrade.finishes_at - Math.floor(Date.now() / 1000)
  const progressPercentage = !isUpgrading ? 0 : 100 - (secondsLeft / researchSeconds) * 100

  const cost = Math.ceil(calcResearchPrice(researchInfo.id, level + (isUpgrading ? 1 : 0)))
  const canAfford = userData.money >= cost

  // Rerender every second while upgrading
  const [, _reload] = useState()
  useEffect(() => {
    if (!isUpgrading) return
    const interval = setInterval(() => _reload({}), 1000)
    return () => clearInterval(interval)
  }, [isUpgrading])

  // Button clicked
  const buttonClicked = () => {
    if (isUpgrading) {
      if (secondsLeft > MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS) return
      manuallyFinishResearch(researchID)
      return
    }

    if (!canAfford) return
    buyResearch(researchID)
  }

  // UI texts
  const remainingTimeText = getRemainingTimeText({
    researchSeconds,
    isUpgrading,
    finishesAt: upgrade && upgrade.finishes_at,
  })
  const titleText = !isUpgrading
    ? 'INVESTIGAR'
    : secondsLeft <= MANUALLY_FINISH_RESEARCH_UPGRADES_SECONDS
    ? 'PULSA PARA COMPLETAR'
    : 'INVESTIGANDO...'
  const bonusIdToNameMap = {
    1: 'espionage',
    2: 'attack',
    3: 'defense',
    6: 'security',
  }
  const bonusName = bonusIdToNameMap[researchID]
  let lvlStr = `Lvl. ${level.toLocaleString()}`
  if (userData.hoodResearchBonuses[bonusName]) {
    lvlStr += ` +${userData.hoodResearchBonuses[bonusName]}`
  }
  if (userData.allianceBuffBonuses[bonusName]) {
    lvlStr += ` +${userData.allianceBuffBonuses[bonusName]}`
  }

  return (
    <Card image={researchImages[researchID]} ribbon={lvlStr} title={researchInfo.name}>
      <ResearchEffectsInfo researchID={researchID} currentLevel={level} price={cost} />
      <IncButton onClick={buttonClicked} disabled={!isUpgrading && !canAfford}>
        <div className={styles.rowsContainer}>
          <span className={styles.remainingTimeText}>{remainingTimeText}</span>
          <IncProgressBar direction="horizontal" progressPercentage={progressPercentage} />
        </div>
        <div className={styles.rowsContainer} style={{ marginTop: 10 }}>
          <IncChevron padding={5} className={styles.priceChevron} direction="right">
            {numberToAbbreviation(cost)} <Icon iconName="money" style={{ marginLeft: 3, marginRight: 3 }} size={20} />
          </IncChevron>
          <span className={styles.title}>{titleText}</span>
        </div>
      </IncButton>
    </Card>
  )
}

function manuallyFinishResearch(researchID) {
  api
    .post('/v1/research/manually_finish', { research_id: researchID })
    .then(() => {
      reloadUserData()
    })
    .catch(err => alert(err.message))
}
