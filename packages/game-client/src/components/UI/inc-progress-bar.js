import React from 'react'
import styles from './inc-progress-bar.module.scss'
import PropTypes from 'prop-types'
import useWindowSize from 'lib/useWindowSize'

IncProgressBar.propTypes = {
  progressPercentage: PropTypes.number.isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  color: PropTypes.oneOf(['green', 'red']),
  children: PropTypes.node,
  minSize: PropTypes.number,
  noBackground: PropTypes.bool,
  visualSteps: PropTypes.number,
  borderSize: PropTypes.number,
}
export default function IncProgressBar({
  progressPercentage,
  direction = 'horizontal',
  color = 'green',
  children,
  borderSize = 0,
  minSize,
  noBackground,
  visualSteps,
}) {
  const windowSize = useWindowSize()
  const progressStyle = {
    [direction === 'vertical' ? 'height' : 'width']: progressPercentage + '%',
  }
  const bgStyle = {
    background: noBackground ? 'none' : undefined,
  }
  const containerStyle = {
    padding: borderSize,
    [direction === 'horizontal' ? 'paddingLeft' : 'paddingBottom']: 0,
    [direction === 'horizontal' ? 'minHeight' : 'minWidth']: minSize || (windowSize.width < 425 ? 20 : 30),
  }

  return (
    <div
      className={`${styles.progress} ${borderSize ? styles.withBorder : ''} ${
        direction === 'vertical' ? styles.vertical : styles.horizontal
      } ${color === 'green' ? styles.colorGreen : styles.colorRed}`}
      style={containerStyle}>
      <div className={styles.bg} style={bgStyle}>
        <div className={styles.inner} style={progressStyle} />
      </div>
      {visualSteps &&
        new Array(visualSteps)
          .fill(null)
          .map((_, index) => (
            <div key={index} className={styles.stepDivider} style={{ right: (index / visualSteps) * 100 + '%' }} />
          ))}
      {children ? <div className={styles.children}>{children}</div> : null}
    </div>
  )
}
