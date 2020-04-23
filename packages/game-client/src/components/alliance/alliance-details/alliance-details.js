import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-details.module.scss'
import AllianceBadge from 'components/alliance/alliance-badge'
import { useHistory } from 'react-router-dom'
import { userData } from 'lib/user'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'

AllianceDetails.propTypes = {
  alliance: PropTypes.object.isRequired,
}
export default function AllianceDetails({ alliance }) {
  const history = useHistory()
  const editPressed = () => {
    history.push('/alliance/edit')
  }

  const isMyAlliance = userData.alliance && alliance.id === userData.alliance.id
  const canEdit = isMyAlliance && userData.alliance_user_rank.permission_admin

  return (
    <IncContainer darkBg>
      <div className={styles.container}>
        <IncContainer outerClassName={styles.badgeContainer} borderSize={2}>
          <AllianceBadge badge={alliance.badge} className={styles.badge} />
        </IncContainer>
        <div className={styles.detailsText}>
          <div className={styles.longName}>
            <span>{alliance.long_name}</span>
            {canEdit && (
              <IncButton outerClassName={styles.editButton} style={{ padding: '5px 20px' }} onClick={editPressed}>
                Editar
              </IncButton>
            )}
          </div>
          <div className={styles.shortName}>[{alliance.short_name}]</div>
          <div className={styles.description}> {alliance.description}</div>
        </div>
      </div>
    </IncContainer>
  )
}
