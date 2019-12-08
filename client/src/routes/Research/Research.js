import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import researchUtils from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'
import { updateUserData, useUserData } from '../../lib/user'
import './Research.scss'

let lastResearchData = null
export default function Researchs() {
  const [researchs, setResearchs] = useState(lastResearchData)
  const [error, setError] = useState(false)

  useEffect(() => {
    lastResearchData = researchs
  }, [researchs])

  useEffect(() => {
    api
      .get('/v1/research')
      .then(res => {
        setResearchs(res.researchs)
      })
      .catch(err => setError(err.message))
  }, [])

  const buyResearch = researchID => async () => {
    const oldCount = researchs[researchID]
    const updateResearchN = newN => setResearchs(Object.assign({}, researchs, { [researchID]: newN }))
    try {
      updateResearchN(oldCount + 1)
      await api.post('/v1/research/buy', { research_id: researchID, count: 1 })
      updateUserData({ researchs: Object.assign({}, researchs, { [researchID]: oldCount + 1 }) })
    } catch (e) {
      updateResearchN(oldCount)
      alert(e.message)
    }
  }

  return (
    <div>
      {error && <h4>{error}</h4>}
      {researchUtils.researchList.map(b => (
        <Research key={b.id} research={b} count={researchs ? researchs[b.id] : 0} buy={buyResearch(b.id)} />
      ))}
    </div>
  )
}

Research.propTypes = {
  research: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  buy: PropTypes.func.isRequired,
}
function Research({ research, count, buy }) {
  const userData = useUserData()
  const coste = Math.ceil(researchUtils.calcResearchPrice(research.id, count))
  const canAfford = userData.money > coste
  return (
    <div className={`research-item ${canAfford ? '' : 'can-not-afford'}`}>
      <div>
        {research.name} (<b>{count}</b>)
      </div>
      <div>Precio: {coste.toLocaleString()}.</div>
      <button className="buy-button" onClick={canAfford ? buy : undefined}>
        Investigar
      </button>
    </div>
  )
}
