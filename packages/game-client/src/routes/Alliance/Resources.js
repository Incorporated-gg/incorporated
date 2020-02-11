import React, { useState } from 'react'
import api from '../../lib/api'
import { calcResourceMax } from 'shared-lib/allianceUtils'
import PropTypes from 'prop-types'
import { useUserData, reloadUserData } from '../../lib/user'
import styles from './Home.module.scss'

AllianceResources.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResources({ alliance, reloadAllianceData }) {
  const userData = useUserData()

  return (
    <div className={styles.container}>
      {Object.values(alliance.resources).map(resourceData => {
        return (
          <SingleResources
            key={resourceData.resource_id}
            researchs={alliance.researchs}
            resourceData={resourceData}
            userResourceAmount={userData.personnel[resourceData.resource_id] || 0}
            reloadAllianceData={reloadAllianceData}
          />
        )
      })}
      <div>
        <h2>Historial de recursos</h2>
        {alliance.resources_log.map(logEntry => {
          return (
            <div key={Math.random()}>
              <b>{logEntry.user.username}</b>: {logEntry.quantity > 0 ? 'metió' : 'sacó'}{' '}
              {Math.abs(logEntry.quantity).toLocaleString()} {logEntry.resource_id}
            </div>
          )
        })}
      </div>
    </div>
  )
}

SingleResources.propTypes = {
  resourceData: PropTypes.object.isRequired,
  researchs: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
  userResourceAmount: PropTypes.number.isRequired,
}
function SingleResources({ resourceData, reloadAllianceData, researchs, userResourceAmount }) {
  const [amount, setAmount] = useState(0)
  const max = calcResourceMax(resourceData.resource_id, researchs)

  const doResources = extracting => e => {
    e.preventDefault()
    api
      .post('/v1/alliance/resources', {
        resource_id: resourceData.resource_id,
        amount: (extracting ? -1 : 1) * amount,
      })
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <div>
      <p>
        <b>{resourceData.name}:</b> {Math.floor(resourceData.quantity).toLocaleString()} / {max.toLocaleString()}
      </p>
      {resourceData.resource_id !== 'money' && <p>Tienes {userResourceAmount.toLocaleString()}</p>}
      <form>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={doResources(true)}>Sacar</button>
        <button onClick={doResources(false)}>Meter</button>
      </form>

      <hr />
    </div>
  )
}
