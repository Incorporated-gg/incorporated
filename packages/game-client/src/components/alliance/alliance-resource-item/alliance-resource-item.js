import React, { useState } from 'react'
import { calcResourceMax } from 'shared-lib/allianceUtils'
import PropTypes from 'prop-types'
import { reloadUserData } from 'lib/user'
import api from 'lib/api'
import styles from './alliance-resource-item.module.scss'
import IncContainer from 'components/UI/inc-container'
import Icon from 'components/icon'
import IncProgressBar from 'components/UI/inc-progress-bar'
import IncButton from 'components/UI/inc-button'
import IncInput from 'components/UI/inc-input/inc-input'

AllianceResourceItem.propTypes = {
  resourceData: PropTypes.object.isRequired,
  researchs: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
  userResourceAmount: PropTypes.number.isRequired,
}
export default function AllianceResourceItem({ resourceData, reloadAllianceData, researchs, userResourceAmount }) {
  const [insertAmount, setInsertAmount] = useState('')
  const [extractAmount, setExtractAmount] = useState('')
  const max = calcResourceMax(resourceData.resource_id, researchs)

  const doResources = isExtracting => e => {
    e.preventDefault()
    api
      .post('/v1/alliance/resources', {
        resource_id: resourceData.resource_id,
        amount: isExtracting ? -extractAmount : insertAmount,
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
  const youHaveAmountText = resourceData.resource_id === 'money' ? '0' : `Tienes ${userResourceAmount.toLocaleString()}`

  return (
    <>
      <div className={styles.title}>{resourceData.name}</div>
      <IncContainer className={styles.amountContainer}>
        <div className={styles.maxAmount}>{max.toLocaleString()}</div>
        <IncProgressBar direction="horizontal" progressPercentage={(resourceData.quantity / max) * 100}>
          <div className={styles.currentAmount}>
            {Math.floor(resourceData.quantity).toLocaleString()} <Icon iconName={iconName} size={20} />
          </div>
        </IncProgressBar>
      </IncContainer>
      <div className={styles.buttonsContainer}>
        <IncButton onClick={doResources(true)}>
          <IncInput
            onClick={e => e.stopPropagation()}
            type="number"
            value={extractAmount}
            onChangeText={setExtractAmount}
            placeholder={youHaveAmountText}
            className={styles.exhangeInput}
          />
          <div className={styles.doExchangeTitle}>RETIRAR</div>
        </IncButton>

        <IncButton onClick={doResources(false)}>
          <IncInput
            onClick={e => e.stopPropagation()}
            type="number"
            value={insertAmount}
            onChangeText={setInsertAmount}
            placeholder={youHaveAmountText}
            className={styles.exhangeInput}
          />
          <div className={styles.doExchangeTitle}>INGRESAR</div>
        </IncButton>
      </div>
    </>
  )
}
