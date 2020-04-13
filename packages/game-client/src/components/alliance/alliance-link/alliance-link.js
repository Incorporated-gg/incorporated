import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import AllianceBadge from 'components/alliance/alliance-badge'
import styles from './alliance-link.module.scss'
import Container from 'components/UI/container'

AllianceLink.propTypes = {
  alliance: PropTypes.object,
  type: PropTypes.oneOf(['longName', 'shortAndLongName', 'shortNameInBraces', 'bigBadge']),
  colorScheme: PropTypes.oneOf(['light', 'dark']),
}
export default function AllianceLink({ alliance, type = 'longName', colorScheme = 'light' }) {
  if (!alliance) return <span>Alianza desconocida</span>

  if (type === 'bigBadge') return <BigBadgeAllianceLink alliance={alliance} />

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

BigBadgeAllianceLink.propTypes = {
  alliance: PropTypes.object,
}
function BigBadgeAllianceLink({ alliance }) {
  return (
    <Link
      to={`/ranking/alliance/${alliance.short_name}`}
      className={`${styles.allianceLink} ${styles.bigBadgeContainer}`}>
      <Container borderSize={3}>
        <AllianceBadge badge={alliance.badge} className={styles.bigBadgeBadge} />
      </Container>
      <div>{alliance.long_name}</div>
    </Link>
  )
}
