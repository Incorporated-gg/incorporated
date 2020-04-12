import React from 'react'
import styles from './progress-bar.module.scss'
import PropTypes from 'prop-types'

ProgressBar.propTypes = {
  progressPercentage: PropTypes.number.isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizontal']).isRequired,
  children: PropTypes.node,
}
export default function ProgressBar({ progressPercentage, direction, children }) {
  const progressStyle = { [direction === 'vertical' ? 'height' : 'width']: progressPercentage + '%' }

  return (
    <div className={`${styles.progress} ${direction === 'vertical' ? styles.vertical : styles.horizontal}`}>
      <div className={styles.bg}>
        <div className={styles.inner} style={progressStyle} />
      </div>
      <div className={styles.shadow} />
      {children ? <div className={styles.children}>{children}</div> : null}
    </div>
  )
}
