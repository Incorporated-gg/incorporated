import React from 'react'
import PropTypes from 'prop-types'
import styles from './inc-button.module.scss'
import IncContainer from './inc-container'

IncButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  outerStyle: PropTypes.object,
  outerClassName: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  noInnerBackground: PropTypes.bool,
}
export default function IncButton({
  children,
  onClick,
  outerClassName,
  outerStyle,
  disabled,
  noInnerBackground,
  style,
  ...props
}) {
  const runOnClick = e => {
    if (disabled || e.defaultPrevented) return
    if (onClick) onClick(e)
  }
  return (
    <IncContainer
      outerClassName={`${styles.button} ${disabled ? styles.disabled : ''} ${outerClassName || ''}`}
      outerStyle={outerStyle}
      style={{ ...style, background: noInnerBackground ? 'none' : undefined }}
      onClick={runOnClick}
      onKeyDown={e => {
        if (e.key === 'Enter') runOnClick(e)
      }}
      tabIndex="0"
      role="button"
      {...props}>
      {children}
    </IncContainer>
  )
}
