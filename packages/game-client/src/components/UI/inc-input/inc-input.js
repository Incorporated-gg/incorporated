import React, { useState } from 'react'
import styles from './inc-input.module.scss'
import PropTypes from 'prop-types'

IncInput.propTypes = {
  multiline: PropTypes.bool,
  showBorder: PropTypes.bool,
  placeholder: PropTypes.any,
  maxLength: PropTypes.any,
  type: PropTypes.oneOf(['text', 'number', 'password', 'range', 'select', 'checkbox']),
  className: PropTypes.string,
  options: PropTypes.object,
  value: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  onChangeText: PropTypes.func.isRequired,
}

export default function IncInput({
  multiline = false,
  showBorder = false,
  type = 'text',
  onChangeText,
  options,
  className,
  min,
  max,
  ...props
}) {
  const [elmID] = useState('incinput-' + Math.random())

  className = `${styles.incInput} ${showBorder ? styles.border : ''} ${className || ''}`
  const onChange = () => {
    const elm = document.getElementById(elmID)

    let result
    if (type === 'range') result = parseInt(elm.value)
    else if (type === 'number') {
      result = parseInt(elm.value)
      max = parseInt(max)
      min = parseInt(min)
      if (!Number.isNaN(max)) result = Math.min(max, result)
      if (!Number.isNaN(min)) result = Math.max(min, result)
    } else if (type === 'checkbox') result = elm.checked
    else result = elm.value

    onChangeText(result)
  }

  if (multiline) return <textarea id={elmID} className={className} onChange={onChange} {...props} />

  if (type === 'select') {
    return (
      <select id={elmID} className={className} onChange={onChange} {...props}>
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
  if (type === 'checkbox') {
    props.checked = props.value
  }

  return (
    <>
      <input id={elmID} type={type} className={className} onChange={onChange} min={min} max={max} {...props} />
      {type === 'checkbox' && (
        // Label for checkbox customization
        <label
          tabIndex="0"
          htmlFor={elmID}
          onKeyPress={e => {
            if (e.key !== 'Enter' && e.key !== ' ') return
            const elm = document.getElementById(elmID)
            elm.checked = !elm.checked
            onChange()
          }}
        />
      )}
    </>
  )
}
