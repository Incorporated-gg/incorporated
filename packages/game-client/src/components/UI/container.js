import React from 'react'
import styles from './container.module.scss'
import PropTypes from 'prop-types'

Container.propTypes = {
  children: PropTypes.node.isRequired,
  darkBg: PropTypes.bool,
  borderSize: PropTypes.number,
  whiteBorder: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  outerStyle: PropTypes.object,
  outerClassName: PropTypes.string,
}

export default function Container({
  children,
  borderSize = 3,
  darkBg,
  disabled,
  whiteBorder,
  className = '',
  outerClassName = '',
  style = {},
  outerStyle = {},
  ...props
}) {
  outerStyle.padding = borderSize
  if (darkBg) style.padding = borderSize

  return (
    <div className={`${styles.container} ${outerClassName}`} style={outerStyle} disabled={disabled}>
      <div
        {...props}
        className={`${styles.inner} ${whiteBorder ? styles.whiteBorder : ''} ${
          darkBg ? styles.darkBg : ''
        } ${className}`}
        style={style}>
        {children}
      </div>
    </div>
  )
}
