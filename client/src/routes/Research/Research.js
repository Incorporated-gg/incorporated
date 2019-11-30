import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import researchUtils from 'shared-lib/researchUtils'
import PropTypes from 'prop-types'

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
      await api.post('/v1/buy_research', { research_id: researchID, count: 1 })
    } catch (e) {
      updateResearchN(oldCount)
      alert(e.message)
    }
  }

  return (
    <div>
      <h2>Research</h2>
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
  const coste = Math.ceil(researchUtils.calcResearchPrice(research.id, count)).toLocaleString()
  return (
    <div>
      <span>{research.name}: </span>
      <span>{count}. </span>
      <span>Precio: {coste}. </span>
      <button onClick={buy}>Investigar</button>
    </div>
  )
}
