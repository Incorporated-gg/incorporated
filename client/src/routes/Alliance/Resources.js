import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'

AllianceResources.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResources({ alliance, reloadAllianceData }) {
  return (
    <div>
      <h2>Resources</h2>
      {Object.values(alliance.resources).map(resourcesData => {
        return (
          <SingleResources
            key={resourcesData.id}
            resourcesData={resourcesData}
            reloadAllianceData={reloadAllianceData}
          />
        )
      })}
    </div>
  )
}

SingleResources.propTypes = {
  resourcesData: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
function SingleResources({ resourcesData, reloadAllianceData }) {
  const [amount, setAmount] = useState(0)

  const doResources = extracting => e => {
    e.preventDefault()
    api
      .post('/v1/alliance_resources', { resource_id: resourcesData.id, amount: (extracting ? -1 : 1) * amount })
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <div>
      <p>{resourcesData.id}</p>
      <p>Quantity: {resourcesData.quantity}</p>
      <form>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={doResources(true)}>Sacar</button>
        <button onClick={doResources(false)}>Meter</button>
      </form>

      <hr />
    </div>
  )
}
