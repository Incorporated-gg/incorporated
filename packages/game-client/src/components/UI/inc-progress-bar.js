import React from 'react'
import styles from './inc-progress-bar.module.scss'
import PropTypes from 'prop-types'

IncProgressBar.propTypes = {
  progressPercentage: PropTypes.number.isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  children: PropTypes.node,
  showBorder: PropTypes.bool,
}
export default function IncProgressBar({ progressPercentage, direction = 'horizontal', children, showBorder = false }) {
  const progressStyle = { [direction === 'vertical' ? 'height' : 'width']: progressPercentage + '%' }

  return (
    <div
      className={`${styles.progress} ${showBorder ? styles.withBorder : ''} ${
        direction === 'vertical' ? styles.vertical : styles.horizontal
      }`}>
      <div className={styles.bg}>
        <div className={styles.inner} style={progressStyle} />
      </div>
      <div className={styles.shadow} />
      {children ? <div className={styles.children}>{children}</div> : null}
    </div>
  )
}
