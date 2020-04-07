import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-details.module.scss'
import AllianceBadge from 'components/alliance/alliance-badge'

AllianceDetails.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceDetails({ alliance }) {
  return (
    <div className={styles.details}>
      <AllianceBadge badge={alliance.badge} className={styles.badge} />
      <div className={styles.detailsText}>
        <h1>
          {alliance.long_name} [{alliance.short_name}]
        </h1>
        <div className={styles.allianceDescText}> {alliance.description}</div>
      </div>
    </div>
  )
}
