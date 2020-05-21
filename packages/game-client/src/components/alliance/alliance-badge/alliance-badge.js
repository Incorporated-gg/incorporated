import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-badge.module.scss'
import ErrorBoundary from 'components/UI/ErrorBoundary'
import { backgroundComponents, iconComponents } from './svgComponents'

AllianceBadge.propTypes = {
  badge: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
}
export default function AllianceBadge(props) {
  return (
    <ErrorBoundary>
      <AllianceBadgeComponent {...props} />
    </ErrorBoundary>
  )
}

AllianceBadgeComponent.propTypes = AllianceBadge.propTypes
function AllianceBadgeComponent({ badge, className, style = {}, ...props }) {
  if (!badge) {
    badge = {
      _v: 1,
      background: { id: 5, color1: '#C0C0C0', color2: '#C0C0C0' },
      icon: { id: 5, color: '#C0C0C0' },
    }
  }

  // Background
  const BackgroundComponent = backgroundComponents[badge.background.id]
  const bgStyle = {
    fill: badge.background.color1,
    color: badge.background.color2,
  }

  // Icon
  const IconComponent = iconComponents[badge.icon.id]
  const iconStyle = {
    color: badge.icon.color,
  }

  return (
    <ErrorBoundary>
      <span className={styles.container + (className ? ` ${className}` : '')} style={style} {...props}>
        <BackgroundComponent className={styles.background} style={bgStyle} />
        <IconComponent className={styles.icon} style={iconStyle} />
      </span>
    </ErrorBoundary>
  )
}
