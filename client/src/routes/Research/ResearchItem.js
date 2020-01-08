import React, { useCallback } from 'react'
import { calcResearchPrice, researchList } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { useUserData } from '../../lib/user'
import './ResearchItem.scss'
import { buyResearch } from './buyResearch'

ResearchItem.propTypes = {
  researchID: PropTypes.number.isRequired,
  children: PropTypes.node,
}
export default function ResearchItem({ researchID, children }) {
  const userData = useUserData()
  const research = researchList.find(r => r.id === researchID)
  const count = userData.researchs[researchID]
  const coste = Math.ceil(calcResearchPrice(research.id, count))
  const canAfford = userData.money > coste
  const buyResearchClicked = useCallback(() => buyResearch(researchID), [researchID])

  return (
    <div className="research-item">
      <div>
        {research.name} (<b>{count}</b>)
      </div>
      <div>Precio: {coste.toLocaleString()}€</div>
      {children}
      <button className="buy-button" disabled={!canAfford} onClick={canAfford ? buyResearchClicked : undefined}>
        Investigar
      </button>
    </div>
  )
}
