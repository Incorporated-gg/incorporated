import React, { useState } from 'react'
import { calcResourceMax } from 'shared-lib/allianceUtils'
import PropTypes from 'prop-types'
import { reloadUserData } from 'lib/user'
import api from 'lib/api'
import styles from './alliance-resource-item.module.scss'
import Container from 'components/UI/container'
import Icon from 'components/icon'
import ProgressBar from 'components/UI/progress-bar'

AllianceResourceItem.propTypes = {
  resourceData: PropTypes.object.isRequired,
  researchs: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
  userResourceAmount: PropTypes.number.isRequired,
}
export default function AllianceResourceItem({ resourceData, reloadAllianceData, researchs, userResourceAmount }) {
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

  const iconName = resourceData.resource_id === 'money' ? 'money' : 'dynamite'

  return (
    <div style={{ marginBottom: 10 }}>
      <div className={styles.title}>{resourceData.name}</div>
      <Container className={styles.amountContainer}>
        <div className={styles.maxAmount}>{max.toLocaleString()}</div>
        <ProgressBar direction="horizontal" progressPercentage={(resourceData.quantity / max) * 100}>
          <div className={styles.currentAmount}>
            {Math.floor(resourceData.quantity).toLocaleString()} <Icon iconName={iconName} size={20} />
          </div>
        </ProgressBar>
      </Container>
      {resourceData.resource_id !== 'money' && <p>Tienes {userResourceAmount.toLocaleString()}</p>}
      <form>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />{' '}
        <button onClick={doResources(true)}>Sacar</button> <button onClick={doResources(false)}>Meter</button>
      </form>
    </div>
  )
}
