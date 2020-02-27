import React, { useCallback } from 'react'
import { calcResearchPrice } from 'shared-lib/researchUtils'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import Card from 'components/card'
import cardStyles from 'components/card/card.module.scss'
import { buyResearch } from '../../../../routes/Research/buyResearch'
import Icon from 'components/icon'
import { numberToAbbreviation } from 'lib/utils'
import Container from 'components/UI/container'
import { useUserData } from 'lib/user'

function BuildingOptimizeResearch() {
  const userData = useUserData()
  const researchID = 5
  const currentOptimizeLvl = userData.researchs[researchID]
  const coste = calcResearchPrice(researchID, currentOptimizeLvl)

  const income = calculateIncomeDiff(userData.buildings, currentOptimizeLvl)
  const timeToRecoverInvestment = (Math.round((coste / income) * 10) / 10).toLocaleString()
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])
  const canBuy = coste < userData.money

  return (
    <Card
      image={require('../../img/central-office.png')}
      title={'Oficina Central'}
      ribbon={`Lvl. ${currentOptimizeLvl.toLocaleString()}`}
      desc={'Al subir de nivel, el resto de edificios darán más dinero.'}>
      <>
        <div className={cardStyles.statContainer}>
          <div>
            <div>PRI</div>
            <div>{timeToRecoverInvestment} días</div>
          </div>
        </div>
        <Container onClick={buyResearchClicked} outerClassName={cardStyles.button} disabled={!canBuy}>
          <div className={cardStyles.buttonNumberContainer}>
            {numberToAbbreviation(coste)} <Icon iconName="money" style={{ marginLeft: 3 }} size={20} />
          </div>
          <h2>{'MEJORAR'}</h2>
        </Container>
      </>
    </Card>
  )
}
export default BuildingOptimizeResearch

function calculateIncomeDiff(buildings, currentOptimizeLvl) {
  let income = 0
  if (buildings) {
    const oldIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, { quantity }]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl),
      0
    )
    const newIncome = Object.entries(buildings).reduce(
      (prev, [buildingID, { quantity }]) =>
        prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, currentOptimizeLvl + 1),
      0
    )
    income = newIncome - oldIncome
  }
  return income
}
