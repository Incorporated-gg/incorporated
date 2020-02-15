import React from 'react'
import PropTypes from 'prop-types'
import styles from './stat.module.scss'

Stat.propTypes = {
  img: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
}
export default function Stat({ img, title, value }) {
  return (
    <div className={styles.statContainer}>
      <div className={styles.statIcon}>
        <img src={img} alt="" />
      </div>
      <div className={styles.statsText}>
        <div className={styles.statTitle}>{title}</div>
        <div className={styles.statValue}>{value}</div>
      </div>
    </div>
  )
}
