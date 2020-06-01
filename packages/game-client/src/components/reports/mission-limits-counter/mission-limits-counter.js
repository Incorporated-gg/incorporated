import React from 'react'
import PropTypes from 'prop-types'
import Icon from 'components/icon'
import styles from './mission-limits-counter.module.scss'
import DiamondShapeIncContainer from '../diamond-shape-inc-container/diamond-shape-inc-container'

MissionLimitsCounter.propTypes = {
  title: PropTypes.string.isRequired,
  iconName: PropTypes.string.isRequired,
  maxMissions: PropTypes.number.isRequired,
  currentMissions: PropTypes.number.isRequired,
}
export default function MissionLimitsCounter({ title, iconName, maxMissions, currentMissions }) {
  return (
    <DiamondShapeIncContainer>
      <Icon className={styles.icon} iconName={iconName} size={16} />
      {new Array(maxMissions).fill(null).map((_, index) => {
        const isFilled = index < currentMissions
        return <div key={index} className={isFilled ? styles.greenArrow : styles.greyArrow} />
      })}
    </DiamondShapeIncContainer>
  )
}
