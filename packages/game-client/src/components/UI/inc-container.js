import React from 'react'
import styles from './inc-container.module.scss'
import PropTypes from 'prop-types'

IncContainer.propTypes = {
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
  onKeyDown: PropTypes.func,
  tabIndex: PropTypes.string,
  role: PropTypes.string,
}

export default function IncContainer({
  children,
  borderSize,
  darkBg,
  disabled,
  withHairline,
  noBackground,
  className = '',
  outerClassName = '',
  style = {},
  outerStyle = {},
  onClick,
  onKeyDown,
  tabIndex,
  role,
  ...props
}) {
  outerStyle.padding = borderSize
  style.padding = borderSize

  return (
    <div
      className={`${styles.container} ${outerClassName}`}
      style={outerStyle}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}>
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
