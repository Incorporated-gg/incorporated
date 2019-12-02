import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
const {
  RESEARCHS_LIST,
  calcResourceGenerationByResearchID,
  calcResourceMaxByResearchID,
} = require('shared-lib/allianceUtils')

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
  const researchInfo = RESEARCHS_LIST.find(r => r.id === researchData.id)
  const [amount, setAmount] = useState(0)

  const doResearch = e => {
    e.preventDefault()
    api
      .post('/v1/alliance/research', { research_id: researchData.id, amount })
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  const isResourceGenerator = Boolean(researchData.id % 2)
  const isResourceBank = !isResourceGenerator

  return (
    <div>
      <p>
        {researchInfo.name} <b>(Lvl {researchData.level})</b>
      </p>
      <p>
        {researchData.progress_money.toLocaleString()} / {researchData.price.toLocaleString()}
      </p>
      {isResourceGenerator && (
        <p>
          Genera {calcResourceGenerationByResearchID(researchData.id, researchData.level).toLocaleString()} al día, al
          mejorarla generará{' '}
          {calcResourceGenerationByResearchID(researchData.id, researchData.level + 1).toLocaleString()} al día
        </p>
      )}
      {isResourceBank && (
        <p>
          Almacena {calcResourceMaxByResearchID(researchData.id, researchData.level).toLocaleString()}, al mejorarla
          almacenará {calcResourceMaxByResearchID(researchData.id, researchData.level + 1).toLocaleString()}
        </p>
      )}
      <form>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={doResearch}>Aportar</button>
      </form>

      <hr />
    </div>
  )
}
