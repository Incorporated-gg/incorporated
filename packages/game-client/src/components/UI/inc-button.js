import React from 'react'
import PropTypes from 'prop-types'
import styles from './inc-button.module.scss'
import Container from './container'

IncButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  outerStyle: PropTypes.object,
  outerClassName: PropTypes.string,
  disabled: PropTypes.bool,
}
export default function IncButton({ children, onClick, outerClassName, outerStyle, disabled, ...props }) {
  onClick = disabled ? undefined : onClick
  return (
    <Container
      outerClassName={`${styles.button} ${disabled ? styles.disabled : ''} ${outerClassName || ''}`}
      outerStyle={outerStyle}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' && onClick) onClick()
      }}
      tabIndex="0"
      role="button"
      {...props}>
      {children}
    </Container>
  )
}
