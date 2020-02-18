import React from 'react'
import styles from './container.module.scss'
import PropTypes from 'prop-types'

Container.propTypes = {
  children: PropTypes.node.isRequired,
  darkBg: PropTypes.bool,
  whiteBorder: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  outerStyle: PropTypes.object,
  outerClassName: PropTypes.string,
}

export default function Container({ children, darkBg, whiteBorder, className, outerClassName, outerStyle, ...props }) {
  return (
    <div className={`${styles.container} ${outerClassName}`} style={outerStyle}>
      <div
        {...props}
        className={`${styles.inner} ${whiteBorder ? styles.whiteBorder : ''} ${
          darkBg ? styles.darkBg : ''
        } ${className}`}>
        {children}
      </div>
    </div>
  )
}
