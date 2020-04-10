import React, { useCallback } from 'react'
import {
  calcBuildingPrice,
  calcBuildingDailyIncome,
  buildingsList,
  calcBuildingMaxMoney,
} from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import { userData as userDataRaw, updateUserData, useUserData } from 'lib/user'
import api from 'lib/api'
import Card from 'components/card'
import useHoldPress from 'lib/useHoldPress'
import Icon from 'components/icon'
import { numberToAbbreviation } from 'lib/utils'
import Container from 'components/UI/container'
import cardStyles from 'components/card/card.module.scss'
import styles from './building.module.scss'

const buildingImages = {
  1: require('./img/b1.png'),
  2: require('./img/b2.png'),
  3: require('./img/b3.png'),
  4: require('./img/b4.png'),
  5: require('./img/b5.png'),
  6: require('./img/b6.png'),
}

Building.propTypes = {
  buildingID: PropTypes.number.isRequired,
}
export default function Building({ buildingID }) {
  const userData = useUserData()
  const buildingInfo = buildingsList.find(b => b.id === buildingID)
  const buildingCount = userData.buildings[buildingID].quantity
  const coste = calcBuildingPrice(buildingID, buildingCount)
  const income = calcBuildingDailyIncome(buildingID, 1, userData.researchs[5])

  const currentOptimizeLvl = userData.researchs[5]
  const hasEnoughOptimizeLvl = currentOptimizeLvl >= buildingInfo.requiredOptimizeResearchLevel

  let desc = ''
  if (!hasEnoughOptimizeLvl) desc = `Necesitas oficina central nivel ${buildingInfo.requiredOptimizeResearchLevel}.`

  const timeToRecoverInvestment = Math.round((coste / income) * 10) / 10

  return (
    <Card
      image={buildingImages[buildingID]}
      title={buildingInfo.name}
      ribbon={buildingCount.toLocaleString()}
      desc={desc}
      disabled={!hasEnoughOptimizeLvl}>
      {!hasEnoughOptimizeLvl ? (
        <span role="img" aria-label="locked" className={styles.buildingLocked}>
          🔒
        </span>
      ) : (
        <>
          <div className={cardStyles.statContainer}>
            <div className={styles.buildingStat}>
              <div className={`titleText shadow ${styles.buildingStatTitle}`}>PRI</div>
              <div className={styles.buildingStatValue}>{numberToAbbreviation(timeToRecoverInvestment)} días</div>
            </div>
            <div className={styles.buildingStat}>
              <div className={`titleText shadow ${styles.buildingStatTitle}`}>Bº/día</div>
              <div className={styles.buildingStatValue}>
                {numberToAbbreviation(income * buildingCount)}{' '}
                <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
              </div>
            </div>
          </div>
          <ExtractScreen buildingID={buildingID} buildingCount={buildingCount} />
          <BuyScreen buildingID={buildingID} coste={coste} hasEnoughOptimizeLvl={hasEnoughOptimizeLvl} />
        </>
      )}
    </Card>
  )
}

BuyScreen.propTypes = {
  buildingID: PropTypes.number.isRequired,
  coste: PropTypes.number.isRequired,
  hasEnoughOptimizeLvl: PropTypes.bool.isRequired,
}
function BuyScreen({ buildingID, coste, hasEnoughOptimizeLvl }) {
  const canAfford = userDataRaw.money > coste
  const canBuy = hasEnoughOptimizeLvl && canAfford

  const onBuyBuildingPressed = useCallback(() => buyBuilding(buildingID), [buildingID])
  const buyHoldPress = useHoldPress({
    callback: onBuyBuildingPressed,
    rampUpMs: 2500,
    initialMs: 600,
    endMs: 100,
  })

  return (
    <Container {...buyHoldPress} outerClassName={cardStyles.button} disabled={!canBuy}>
      <div className={cardStyles.buttonNumberContainer}>
        <span className={cardStyles.buttonNumberText}>
          {numberToAbbreviation(coste)} <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
        </span>
      </div>
      <h2 className={`titleText shadow pascal ${styles.buildingAction}`}>{'CONSTRUIR'}</h2>
    </Container>
  )
}

ExtractScreen.propTypes = {
  buildingID: PropTypes.number.isRequired,
  buildingCount: PropTypes.number.isRequired,
}
function ExtractScreen({ buildingID, buildingCount }) {
  const accumulatedMoney = userDataRaw.buildings[buildingID].money
  const bankResearchLevel = userDataRaw.researchs[4]
  const maxMoney = calcBuildingMaxMoney({ buildingID, buildingAmount: buildingCount, bankResearchLevel })

  const onExtractMoney = useCallback(async () => {
    try {
      const extractedMoney = userDataRaw.buildings[buildingID].money
      updateUserData({
        money: userDataRaw.money + extractedMoney,
        buildings: {
          ...userDataRaw.buildings,
          [buildingID]: { ...userDataRaw.buildings[buildingID], money: 0 },
        },
      })
      await api.post('/v1/buildings/extract_money', { building_id: buildingID })
    } catch (e) {
      alert(e.message)
    }
  }, [buildingID])

  const progress = (accumulatedMoney / maxMoney.maxTotal) * 100
  return (
    <Container outerClassName={cardStyles.button} onClick={onExtractMoney}>
      <div className={cardStyles.buttonNumberContainer}>
        <div className={cardStyles.buttonNumberProgress} style={{ width: progress + '%' }} />
        <div className={cardStyles.buttonNumberText}>
          {numberToAbbreviation(accumulatedMoney)} / {numberToAbbreviation(maxMoney.maxTotal)}{' '}
          <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
        </div>
      </div>
      <h2 className={`titleText shadow pascal ${styles.buildingAction}`}>{'RECOGER'}</h2>
    </Container>
  )
}

async function buyBuilding(buildingID) {
  const currentAmount = userDataRaw.buildings[buildingID].quantity
  const coste = calcBuildingPrice(buildingID, currentAmount)
  if (coste > userDataRaw.money) return
  try {
    updateUserData({
      money: userDataRaw.money - coste,
      buildings: {
        ...userDataRaw.buildings,
        [buildingID]: { ...userDataRaw.buildings[buildingID], quantity: currentAmount + 1 },
      },
    })
    await api.post('/v1/buildings/buy', { building_id: buildingID, count: 1 })
  } catch (e) {
    alert(e.message)
  }
}
