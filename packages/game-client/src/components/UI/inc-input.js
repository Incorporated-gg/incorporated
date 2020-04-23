import React from 'react'
import styles from './inc-input.module.scss'
import PropTypes from 'prop-types'

IncInput.propTypes = {
  multiline: PropTypes.bool,
  showBorder: PropTypes.bool,
  placeholder: PropTypes.any,
  maxLength: PropTypes.any,
  type: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.any.isRequired,
  onChangeText: PropTypes.func.isRequired,
}

export default function IncInput({ multiline = false, showBorder = false, onChangeText, className, ...props }) {
  className = `${styles.incInput} ${showBorder ? styles.border : ''} ${className || ''}`
  const onChange = e => onChangeText(e.target.value)

  if (multiline) return <textarea className={className} onChange={onChange} {...props} />
  return <input className={className} onChange={onChange} {...props} />
}
