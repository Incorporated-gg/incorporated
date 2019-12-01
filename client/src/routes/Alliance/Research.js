import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
const { RESEARCHS_LIST } = require('shared-lib/allianceUtils')

AllianceResearch.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResearch({ alliance, reloadAllianceData }) {
  return (
    <div>
      <h2>Research</h2>
      {Object.values(alliance.researchs).map(researchData => {
        return (
          <SingleResearch key={researchData.id} researchData={researchData} reloadAllianceData={reloadAllianceData} />
        )
      })}
    </div>
  )
}

SingleResearch.propTypes = {
  researchData: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
function SingleResearch({ researchData, reloadAllianceData }) {
  const research = RESEARCHS_LIST.find(r => r.id === researchData.id)
  const [amount, setAmount] = useState(0)

  const doResearch = e => {
    e.preventDefault()
    api
      .post('/v1/alliance_research', { research_id: researchData.id, amount })
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <div>
      <p>
        {research.name} <b>(Lvl {researchData.level})</b>
      </p>
      <p>
        {researchData.progress_money.toLocaleString()} / {researchData.price.toLocaleString()}
      </p>
      <form>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={doResearch}>Aportar</button>
      </form>

      <hr />
    </div>
  )
}
