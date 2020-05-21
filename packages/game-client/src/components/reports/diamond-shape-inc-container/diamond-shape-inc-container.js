import React from 'react'
import PropTypes from 'prop-types'
import IncContainer from 'components/UI/inc-container'
import styles from './diamond-shape-inc-container.module.scss'

DiamondShapeIncContainer.propTypes = {
  darkBg: PropTypes.bool,
}
export default function DiamondShapeIncContainer(props) {
  return (
    <IncContainer
      outerClassName={styles.containerOuter}
      className={`${styles.containerInner} ${props.darkBg ? styles.darkBg : ''}`}
      {...props}
    />
  )
}
