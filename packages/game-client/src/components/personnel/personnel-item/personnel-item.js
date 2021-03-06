import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { reloadUserData, useUserData } from 'lib/user'
import Card from 'components/card'
import api from 'lib/api'
import styles from './personnel-item.module.scss'
import Icon from 'components/icon'
import IncInput from 'components/UI/inc-input/inc-input'
import IncButton from 'components/UI/inc-button'
import { useLocation } from 'react-router-dom'
import IncChevron from 'components/UI/inc-chevron'
import { numberToAbbreviation } from 'lib/utils'
import calcGuardsSuggestion from './calcGuardsSuggestion'

const personnelImages = {
  sabots: require('./img/gangster.png'),
  guards: require('./img/guard.png'),
  spies: require('./img/spy.png'),
  thieves: require('./img/thief.png'),
}

PersonnelItem.propTypes = {
  personnelInfo: PropTypes.object.isRequired,
  resourceAmount: PropTypes.number.isRequired,
}
export default function PersonnelItem({ personnelInfo, resourceAmount }) {
  const location = useLocation()
  const userData = useUserData()
  const action = location.pathname.split('/')[2]
  const isHiring = action === 'hire'

  const [amount, setAmount] = useState('')

  const buttonClicked = e => {
    e.preventDefault()
    api
      .post(`/v1/personnel/${action}`, {
        resource_id: personnelInfo.resource_id,
        amount,
      })
      .then(reloadUserData)
      .catch(err => {
        alert(err.message)
      })
  }

  const actionPriceForSingleItem = isHiring ? personnelInfo.price : personnelInfo.firingCost
  const actionPriceNum = actionPriceForSingleItem * (amount || 0)
  const dailyPriceNum = personnelInfo.dailyMaintenanceCost * (isHiring ? amount || 0 : resourceAmount)

  return (
    <Card
      image={personnelImages[personnelInfo.resource_id]}
      title={personnelInfo.name}
      ribbon={resourceAmount.toLocaleString()}>
      <p>
        {personnelInfo.resource_id === 'sabots'
          ? 'Matan guardias y destruyen edificios'
          : personnelInfo.resource_id === 'guards'
          ? `Defienden contra ataques. Como sugerencia, deberías tener alrededor de ${numberToAbbreviation(
              calcGuardsSuggestion()
            )}`
          : personnelInfo.resource_id === 'spies'
          ? 'Obtienen información privada sobre otros jugadores'
          : personnelInfo.resource_id === 'thieves'
          ? 'Roban dinero de edificios'
          : '??'}
      </p>

      <IncInput
        showBorder
        className={styles.input}
        min={1}
        max={userData.money / actionPriceForSingleItem}
        placeholder={0}
        type="number"
        value={amount}
        onChangeText={setAmount}
      />

      <IncButton outerClassName={styles.button} onClick={buttonClicked}>
        <div className={styles.dailyPriceContainer}>
          <IncChevron direction="right" padding={16} />
          <div className={styles.dailyPriceText}>
            {numberToAbbreviation(dailyPriceNum)} <Icon iconName="money" size={20} /> / día
          </div>
          <IncChevron direction="left" padding={16} />
        </div>
        <div className={styles.actionPriceContainer}>
          <IncChevron direction="right" padding={6}>
            <div className={styles.actionPriceText}>
              {numberToAbbreviation(actionPriceNum)} <Icon iconName="money" size={20} />
            </div>
          </IncChevron>
          <span className={styles.actionTitle}>{isHiring ? 'CONTRATAR' : 'DESPEDIR'}</span>
        </div>
      </IncButton>
    </Card>
  )
}
