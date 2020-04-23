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
}
export default function IncButton({ children, onClick, outerClassName, outerStyle, disabled, ...props }) {
  const runOnClick = e => {
    if (disabled || e.defaultPrevented) return
    onClick(e)
  }
  return (
    <IncContainer
      outerClassName={`${styles.button} ${disabled ? styles.disabled : ''} ${outerClassName || ''}`}
      outerStyle={outerStyle}
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
