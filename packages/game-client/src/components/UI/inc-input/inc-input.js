import React from 'react'
import styles from './inc-input.module.scss'
import PropTypes from 'prop-types'

IncInput.propTypes = {
  multiline: PropTypes.bool,
  showBorder: PropTypes.bool,
  placeholder: PropTypes.any,
  maxLength: PropTypes.any,
  type: PropTypes.oneOf(['text', 'number', 'password', 'range', 'select']),
  className: PropTypes.string,
  options: PropTypes.object,
  value: PropTypes.any.isRequired,
  onChangeText: PropTypes.func.isRequired,
}

export default function IncInput({
  multiline = false,
  showBorder = false,
  type = 'text',
  onChangeText,
  options,
  className,
  ...props
}) {
  className = `${styles.incInput} ${showBorder ? styles.border : ''} ${className || ''}`
  const onChange = e => {
    let value = e.target.value
    if (type === 'number' || type === 'range') value = parseInt(value)
    onChangeText(value)
  }

  if (multiline) return <textarea className={className} onChange={onChange} {...props} />

  if (type === 'select') {
    return (
      <select className={className} onChange={onChange} {...props}>
        {Object.entries(options).map(([key, val]) => {
          return (
            <option key={key} value={key}>
              {val}
            </option>
          )
        })}
      </select>
    )
  }

  return <input type={type} className={className} onChange={onChange} {...props} />
}
