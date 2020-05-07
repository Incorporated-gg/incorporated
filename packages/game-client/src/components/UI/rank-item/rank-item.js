import React, { useState } from 'react'
import styles from './rank-item.module.scss'
import PropTypes from 'prop-types'
import { numberToAbbreviation } from 'lib/utils'
import Icon from 'components/icon'
import IncContainer from '../inc-container'
import IncButton from '../inc-button'
import ActionsDropdown from './actions-dropdown'

RankItem.propTypes = {
  children: PropTypes.node.isRequired,
  rank: PropTypes.number.isRequired,
  user: PropTypes.object,
  pointsType: PropTypes.oneOf(['income', 'research', 'alliances']).isRequired,
  points: PropTypes.number.isRequired,
}
export default function RankItem({ user, rank, children, pointsType, points }) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const iconProps = {}
  if (pointsType === 'income' || pointsType === 'alliances') iconProps.iconName = 'money'
  else if (pointsType === 'research') iconProps.svg = require('./img/ranking_invest.svg')

  return (
    <div className={styles.rankingItem}>
      <div className={`${styles.rankPosition} pos${rank}`}>{rank.toLocaleString()}.</div>
      <div className={styles.username}>{children}</div>
      <div className={styles.actions}>
        {user && (
          <>
            <IncButton onClick={() => setIsActionsOpen(!isActionsOpen)} borderSize={3}>
              &nbsp;···&nbsp;
            </IncButton>
            <ActionsDropdown user={user} isOpen={isActionsOpen} onRequestClose={() => setIsActionsOpen(false)} />
          </>
        )}
      </div>
      <div className={styles.points}>
        <IncContainer className={styles.pointsContainer}>
          <span style={{ color: '#000' }}>{numberToAbbreviation(points)}</span>{' '}
          <Icon className={styles.icon} {...iconProps} />
        </IncContainer>
      </div>
    </div>
  )
}
