import React, { useCallback } from 'react'
import { ReactSVG } from 'react-svg'
import PropTypes from 'prop-types'
import styles from './icon.module.scss'

Icon.propTypes = {
  iconName: PropTypes.oneOf(['arrows', 'dynamite', 'gold', 'money']),
  svg: PropTypes.any,
  width: PropTypes.number,
  height: PropTypes.number,
  size: PropTypes.number,
  className: PropTypes.string,
}

function Icon({ iconName, svg, size, className = '', width, height, ...props }) {
  if (size) {
    width = size
    height = size
  }

  const beforeInjection = useCallback(
    svgElm => {
      if (!width || !height) return
      svgElm.setAttribute('style', `width: ${width}px; height: ${height}px`)
    },
    [height, width]
  )

  return (
    <ReactSVG
      wrapper="span"
      className={`${styles.svg} ${className}`}
      src={svg || require(`./img/${iconName}.svg`)}
      beforeInjection={beforeInjection}
      {...props}
    />
  )
}

export default Icon
