import React from 'react'
import PropTypes from 'prop-types'
import styles from './style.module.scss'

import { ReactComponent as MoneyIcon } from './img/money.svg'

function generateIcon(Svg) {
  function Icon({ size, className = '', ...props }) {
    if (size) {
      props.width = size
      props.height = size
    }

    return <Svg className={`${styles.svg} ${className}`} {...props} />
  }
  Icon.propTypes = {
    svg: PropTypes.func,
    size: PropTypes.number,
    className: PropTypes.string,
  }
  return Icon
}

export const IconMoney = generateIcon(MoneyIcon)
