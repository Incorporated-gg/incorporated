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
  return (
    <Container
      outerClassName={`${styles.button} ${disabled ? styles.disabled : ''} ${outerClassName || ''}`}
      outerStyle={outerStyle}
      onClick={disabled ? undefined : onClick}
      {...props}>
      {children}
    </Container>
  )
}
