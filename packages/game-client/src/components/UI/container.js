import React from 'react'
import styles from './container.module.scss'
import PropTypes from 'prop-types'

Container.propTypes = {
  children: PropTypes.node.isRequired,
  darkBg: PropTypes.bool,
  borderSize: PropTypes.number,
  withHairline: PropTypes.bool,
  noBackground: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  outerStyle: PropTypes.object,
  outerClassName: PropTypes.string,
  onClick: PropTypes.func,
}

export default function Container({
  children,
  borderSize = 5,
  darkBg,
  disabled,
  withHairline,
  noBackground,
  className = '',
  outerClassName = '',
  style = {},
  outerStyle = {},
  onClick,
  ...props
}) {
  outerStyle.padding = borderSize
  style.padding = borderSize

  return (
    <div className={`${styles.container} ${outerClassName}`} style={outerStyle} disabled={disabled} onClick={onClick}>
      <div
        {...props}
        className={`${styles.inner} ${noBackground ? styles.noBackground : ''} ${
          withHairline ? styles.withHairline : ''
        } ${darkBg ? styles.darkBg : ''} ${className}`}
        style={style}>
        {children}
      </div>
    </div>
  )
}
