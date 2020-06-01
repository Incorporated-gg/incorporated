import React, { useCallback } from 'react'
import { ReactSVG } from 'react-svg'
import PropTypes from 'prop-types'
import styles from './icon.module.scss'

Icon.propTypes = {
  iconName: PropTypes.oneOf([
    'arrows',
    'dynamite',
    'dynamite_stack',
    'dynamite_monochrome',
    'gold',
    'money',
    'money_double_stack',
    'spy_map',
    'thief',
    'guard',
  ]),
  svg: PropTypes.any,
  width: PropTypes.number,
  height: PropTypes.number,
  size: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
}

function Icon({ iconName, svg, size, style = {}, className = '', width, height, ...props }) {
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

  if (!svg && !iconName) {
    console.error('<Icon> got neither svg nor iconName props')
    return null
  }

  try {
    if (require(`./img/${iconName}.png`)) {
      return (
        <img
          alt=""
          className={`${styles.svg} ${className}`}
          src={require(`./img/${iconName}.png`)}
          style={{ ...style, width, height }}
          {...props}
        />
      )
    }
  } catch (err) {}

  return (
    <ReactSVG
      wrapper="span"
      className={`${styles.svg} ${className}`}
      src={svg || require(`./img/${iconName}.svg`)}
      beforeInjection={beforeInjection}
      style={style}
      {...props}
    />
  )
}

export default Icon
