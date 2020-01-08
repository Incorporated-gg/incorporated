import React, { useCallback } from 'react'
import { calcResearchPrice, researchList } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { useUserData } from '../../lib/user'
import { buyResearch } from './buyResearch'
import Card, { Stat } from '../../components/Card'
import cardStyles from '../../components/Card.module.scss'

const researchImages = {
  1: require('./img/spy.png'),
  2: require('./img/attack.png'),
  3: require('./img/defense.png'),
  4: require('./img/bank.png'),
  6: require('./img/security.png'),
}
const researchAccentColors = {
  1: '#EE5487',
  2: '#612aab',
  3: '#82BB30',
  4: '#378cd8',
  6: '#A13647',
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
  const research = researchList.find(r => r.id === researchID)
  const level = userData.researchs[researchID]
  const cost = Math.ceil(calcResearchPrice(research.id, level))
  const canAfford = userData.money > cost
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])

  return (
    <Card
      cost={cost.toLocaleString()}
      title={research.name}
      subtitle={`Lvl. ${level.toLocaleString()}`}
      desc={researchDescriptions[researchID]}
      accentColor={researchAccentColors[researchID]}
      image={researchImages[researchID]}>
      <Stat img={require('./img/stat-price.png')} title={'Coste'} value={`${cost.toLocaleString()}€`} />

      <button
        className={cardStyles.buyButton}
        onClick={buyResearchClicked}
        disabled={!canAfford}
        style={{ color: researchAccentColors[researchID] }}>
        MEJORAR
      </button>
    </Card>
  )
}
