import React, { useCallback } from 'react'
import api from '../../lib/api'
import { calcResearchPrice, researchList } from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { updateUserData, useUserData } from '../../lib/user'
import './ResearchItem.scss'

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
  const buyResearch = useCallback(async () => {
    try {
      await api.post('/v1/research/buy', { research_id: researchID, count: 1 })
      const newCount = userData.researchs[researchID] + 1
      updateUserData({ researchs: Object.assign({}, userData.researchs, { [researchID]: newCount }) })
    } catch (e) {
      alert(e.message)
    }
  }, [researchID, userData.researchs])

  return (
    <div className={`research-item ${canAfford ? '' : 'can-not-afford'}`}>
      <div>
        {research.name} (<b>{count}</b>)
      </div>
      <div>Precio: {coste.toLocaleString()}€</div>
      {children}
      <button className="buy-button" onClick={canAfford ? buyResearch : undefined}>
        Investigar
      </button>
    </div>
  )
}
