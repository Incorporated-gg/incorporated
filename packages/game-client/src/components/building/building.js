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
import styles from './building.module.scss'
import IncButton from 'components/UI/inc-button'
import ProgressBar from 'components/UI/progress-bar'
import IncChevron from 'components/UI/inc-chevron'

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

  const timeToRecoverInvestment = Math.round((coste / income) * 10) / 10

  return (
    <Card
      image={buildingImages[buildingID]}
      title={buildingInfo.name}
      ribbon={buildingCount.toLocaleString()}
      disabled={!hasEnoughOptimizeLvl}>
      {!hasEnoughOptimizeLvl ? (
        <>
          <span>Necesitas oficina central nivel {buildingInfo.requiredOptimizeResearchLevel}.</span>
          <span role="img" aria-label="locked" className={styles.buildingLocked}>
            🔒
          </span>
        </>
      ) : (
        <>
          <div className={styles.statContainer}>
            <span className={styles.statTitle}>Retorno de Inversión:</span>
            <span className={styles.statValue}>{numberToAbbreviation(timeToRecoverInvestment)} DÍAS</span>
          </div>
          <div className={styles.statContainer}>
            <span className={styles.statTitle}>Beneficios por día:</span>
            <span className={styles.statValue}>
              {numberToAbbreviation(income * buildingCount)}{' '}
              <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
            </span>
          </div>
          <ExtractButton buildingID={buildingID} buildingCount={buildingCount} />
          <BuyButton buildingID={buildingID} coste={coste} hasEnoughOptimizeLvl={hasEnoughOptimizeLvl} />
        </>
      )}
    </Card>
  )
}

BuyButton.propTypes = {
  buildingID: PropTypes.number.isRequired,
  coste: PropTypes.number.isRequired,
  hasEnoughOptimizeLvl: PropTypes.bool.isRequired,
}
function BuyButton({ buildingID, coste, hasEnoughOptimizeLvl }) {
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
    <IncButton {...buyHoldPress} disabled={!canBuy} outerStyle={{ marginTop: 10 }}>
      <div className={styles.buttonInfoText}>
        <IncChevron padding={12} direction="right" />
        <span style={{ flexGrow: 1 }}>
          {numberToAbbreviation(coste)} <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
        </span>
        <IncChevron padding={12} direction="left" />
      </div>
      <h2 className={styles.actionButton}>{'CONSTRUIR'}</h2>
    </IncButton>
  )
}

ExtractButton.propTypes = {
  buildingID: PropTypes.number.isRequired,
  buildingCount: PropTypes.number.isRequired,
}
function ExtractButton({ buildingID, buildingCount }) {
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
    <IncButton onClick={onExtractMoney}>
      <div className={styles.buttonInfoText}>
        <span style={{ marginRight: 5 }}>{numberToAbbreviation(maxMoney.maxTotal)}</span>
        <ProgressBar direction="horizontal" progressPercentage={progress}>
          <span className={styles.progressText}>
            {numberToAbbreviation(accumulatedMoney)}
            <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
          </span>
        </ProgressBar>
      </div>
      <h2 className={styles.actionButton}>{'RECOGER'}</h2>
    </IncButton>
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
