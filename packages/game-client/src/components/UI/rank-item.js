import React from 'react'
import styles from './rank-item.module.scss'
import PropTypes from 'prop-types'
import { numberToAbbreviation } from 'lib/utils'
import Icon from 'components/icon'
import IncContainer from './inc-container'

RankItem.propTypes = {
  children: PropTypes.node.isRequired,
  rank: PropTypes.number.isRequired,
  pointsType: PropTypes.oneOf(['income', 'research']).isRequired,
  points: PropTypes.number.isRequired,
}
export default function RankItem({ rank, children, pointsType, points }) {
  return (
    <div className={styles.rankingItem}>
      <div className={`${styles.rankPosition} pos${rank}`}>{rank.toLocaleString()}.</div>
      <div className={styles.username}>{children}</div>
      <div className={styles.points}>
        <IncContainer className={styles.pointsContainer}>
          <span style={{ color: '#000' }}>{numberToAbbreviation(points)}</span>{' '}
          <Icon className={styles.icon} iconName={pointsType === 'income' ? 'money' : 'dynamite'} />
        </IncContainer>
      </div>
    </div>
  )
}
