import React from 'react'
import styles from './RankItem.module.scss'
import PropTypes from 'prop-types'

RankItem.propTypes = {
  children: PropTypes.node.isRequired,
  rank: PropTypes.number.isRequired,
  pointsString: PropTypes.string.isRequired,
}
export default function RankItem({ rank, children, pointsString }) {
  return (
    <div className={styles.rankingItem}>
      <div className={`${styles.rankPosition} pos${rank}`}>{rank.toLocaleString()}.</div>
      <div className={styles.username}>{children}</div>
      <div className={styles.points}>{pointsString}</div>
    </div>
  )
}
