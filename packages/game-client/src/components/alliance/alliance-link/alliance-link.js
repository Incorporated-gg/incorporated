import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import AllianceBadge from 'components/alliance/alliance-badge'
import styles from './alliance-link.module.scss'

AllianceLink.propTypes = {
  alliance: PropTypes.object,
  type: PropTypes.oneOf(['longName', 'shortAndLongName', 'shortNameInBraces']),
  colorScheme: PropTypes.oneOf(['light', 'dark']),
}
export default function AllianceLink({ alliance, type = 'longName', colorScheme = 'light' }) {
  if (!alliance) return <span>Alianza desconocida</span>
  const text =
    type === 'longName'
      ? alliance.long_name
      : type === 'shortNameInBraces'
      ? `[${alliance.short_name}]`
      : `${alliance.long_name} (${alliance.short_name})`

  return (
    <Link
      to={`/ranking/alliance/${alliance.short_name}`}
      className={`${styles.allianceLink} ${(colorScheme === 'dark' && styles.darkColors) || ''}`}>
      <AllianceBadge badge={alliance.badge} className={styles.badge} />
      <span className={styles.name}>{text}</span>
    </Link>
  )
}
