import React from 'react'
import { ReactSVG } from 'react-svg'
import PropTypes from 'prop-types'
import styles from './icon.module.scss'

Icon.propTypes = {
  iconName: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
}

function Icon({ iconName, size, className = '', ...props }) {
  if (size) {
    props.width = size
    props.height = size
  }
  return <ReactSVG className={`${styles.svg} ${className}`} src={require(`./img/${iconName}.svg`)} {...props} />
}

export default Icon
