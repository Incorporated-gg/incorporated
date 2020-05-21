import React from 'react'
import PropTypes from 'prop-types'
import styles from './inc-chevron.module.scss'

IncChevron.propTypes = {
  direction: PropTypes.oneOf(['right', 'left']).isRequired,
  padding: PropTypes.number.isRequired,
  chevronSize: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string,
}
export default function IncChevron({ direction, padding, chevronSize = 15, className = '', style, ...props }) {
  const clipPaths = {
    right: `polygon(100% 0%, calc(100% - ${chevronSize}px) 50%, 100% 100%, 0 100%, 0 0)`,
    left: `polygon(100% 0%, 100% 100%, 0 100%, ${chevronSize}px 50%, 0 0)`,
  }
  return (
    <div
      className={`${className} ${styles.chevron}`}
      style={{
        ...style,
        padding,
        [direction === 'left' ? 'paddingLeft' : 'paddingRight']: padding + chevronSize,
        clipPath: clipPaths[direction],
        webkitClipPath: clipPaths[direction],
      }}
      {...props}
    />
  )
}
