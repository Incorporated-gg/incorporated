import React from 'react'
import styles from './inc-progress-bar.module.scss'
import PropTypes from 'prop-types'

IncProgressBar.propTypes = {
  progressPercentage: PropTypes.number.isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  color: PropTypes.oneOf(['green', 'red']),
  children: PropTypes.node,
  minSize: PropTypes.number,
  visualSteps: PropTypes.number,
  borderSize: PropTypes.number,
  roundRightSide: PropTypes.bool,
}
export default function IncProgressBar({
  progressPercentage,
  direction = 'horizontal',
  color = 'green',
  children,
  borderSize = 0,
  minSize,
  visualSteps,
  roundRightSide,
}) {
  const progressStyle = {
    [direction === 'vertical' ? 'height' : 'width']: progressPercentage + '%',
  }
  const containerStyle = {
    padding: borderSize,
    [direction === 'horizontal' ? 'paddingLeft' : 'paddingBottom']: 0,
    [direction === 'horizontal' ? 'minHeight' : 'minWidth']: minSize || 30,
  }

  return (
    <div
      className={`${styles.progress} ${borderSize ? styles.withBorder : ''} ${
        direction === 'vertical' ? styles.vertical : styles.horizontal
      } ${color === 'green' ? styles.colorGreen : styles.colorRed} ${roundRightSide ? styles.roundRightSide : ''}`}
      style={containerStyle}>
      <div>
        <div className={styles.bg}>
          <div className={styles.inner} style={progressStyle} />
        </div>
        {visualSteps &&
          new Array(visualSteps - 1)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className={styles.stepDivider}
                style={{ left: ((index + 1) / visualSteps) * 100 + '%' }}
              />
            ))}
        {children ? <div className={styles.children}>{children}</div> : null}
      </div>
    </div>
  )
}
