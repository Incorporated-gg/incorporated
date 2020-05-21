import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import AllianceBadge from 'components/alliance/alliance-badge'
import styles from './alliance-link.module.scss'

AllianceLink.propTypes = {
  alliance: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  type: PropTypes.oneOf(['longName', 'shortAndLongName', 'shortNameInBraces', 'bigBadge']),
  colorScheme: PropTypes.oneOf(['light', 'dark']),
}
export default function AllianceLink({ alliance, type = 'longName', colorScheme = 'light' }) {
  const linkTo = !alliance ? () => {} : `/ranking/alliance/${alliance.short_name}`

  const text = !alliance
    ? '\xA0' // Non-breaking space
    : type === 'longName'
    ? alliance.long_name
    : type === 'shortNameInBraces' || type === 'bigBadge'
    ? `[${alliance.short_name}]`
    : `${alliance.long_name} (${alliance.short_name})`

  return (
    <Link
      to={linkTo}
      className={`${styles.allianceLink} ${(colorScheme === 'dark' && styles.darkColors) || ''} ${(type ===
        'bigBadge' &&
        styles.bigBadge) ||
        ''}`}>
      <AllianceBadge badge={alliance?.badge} className={styles.badge} />
      <span className={styles.name}>{text}</span>
    </Link>
  )
}
