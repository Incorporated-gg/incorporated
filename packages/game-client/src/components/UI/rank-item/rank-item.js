import React, { useState } from 'react'
import styles from './rank-item.module.scss'
import PropTypes from 'prop-types'
import { numberToAbbreviation } from 'lib/utils'
import Icon from 'components/icon'
import IncContainer from '../inc-container'
import IncButton from '../inc-button'
import ActionsDropdown from './actions-dropdown'
import { userData } from 'lib/user'

RankItem.propTypes = {
  children: PropTypes.node.isRequired,
  rank: PropTypes.number.isRequired,
  user: PropTypes.object,
  pointsType: PropTypes.oneOf(['income', 'research', 'alliances']).isRequired,
  points: PropTypes.number.isRequired,
}
export default function RankItem({ user, rank, children, pointsType, points }) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const isMe = userData?.id === user?.id

  const iconProps = {}
  if (pointsType === 'research') iconProps.svg = require('./img/ranking_invest.svg')
  else iconProps.iconName = 'money_double_stack'

  return (
    <div className={styles.rankingItem}>
      <div className={`${styles.rankPosition} pos${rank}`}>{rank.toLocaleString()}.</div>
      <div className={styles.username}>{children}</div>
      <div className={styles.actions}>
        {user && (
          <>
            <IncButton disabled={isMe} onClick={() => setIsActionsOpen(!isActionsOpen)} borderSize={3}>
              &nbsp;···&nbsp;
            </IncButton>
            <ActionsDropdown user={user} isOpen={isActionsOpen} onRequestClose={() => setIsActionsOpen(false)} />
          </>
        )}
      </div>
      <div className={styles.points}>
        <IncContainer className={styles.pointsContainer}>
          <span style={{ color: '#000' }}>{numberToAbbreviation(points)}</span>{' '}
          <Icon size={41} className={styles.icon} {...iconProps} />
        </IncContainer>
      </div>
    </div>
  )
}
