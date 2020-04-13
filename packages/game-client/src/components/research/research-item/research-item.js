import React, { useCallback } from 'react'
import { researchList, calcResearchPrice } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { useUserData, userData } from 'lib/user'
import { numberToAbbreviation } from 'lib/utils'
import { buyResearch } from './buyResearch'
import Card from 'components/card'
import cardStyles from 'components/card/card.module.scss'
import Container from 'components/UI/container'
import Icon from 'components/icon'
import styles from './research-item.module.scss'
import TimerButtonNumber from '../timer-button-number/timer-button-number'
import UpgradeInstantlyButton from '../upgrade-instantly-button/upgrade-instantly-button'
import ResearchEffectsInfo from '../research-effects-info/research-effects-info'

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
  const upgrade = userData.activeResearchs.find(ar => ar.research_id === researchID)
  const researchInfo = researchList.find(r => r.id === researchID)
  const level = userData.researchs[researchID]
  const cost = Math.ceil(calcResearchPrice(researchInfo.id, level + (upgrade ? 1 : 0)))
  const canAfford = userData.money > cost
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])

  return (
    <Card
      cost={cost.toLocaleString()}
      title={researchInfo.name}
      ribbon={`Lvl. ${level.toLocaleString()}`}
      image={researchImages[researchID]}>
      <ResearchEffectsInfo researchID={researchID} currentLevel={level} price={cost} />
      <TimerButtonNumber
        finishesAt={upgrade && upgrade.finishes_at}
        researchID={researchID}
        level={level}
        isUpgrading={Boolean(upgrade)}
        skipResearchDuration={researchInfo.skipResearchDuration}
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
