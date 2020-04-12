import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-details.module.scss'
import AllianceBadge from 'components/alliance/alliance-badge'
import Container from './container'
import { useHistory } from 'react-router-dom'
import { userData } from 'lib/user'
import IncButton from './inc-button'

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
    <Container darkBg>
      <div className={styles.container}>
        <Container outerClassName={styles.badgeContainer} borderSize={2}>
          <AllianceBadge badge={alliance.badge} className={styles.badge} />
        </Container>
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
    </Container>
  )
}
