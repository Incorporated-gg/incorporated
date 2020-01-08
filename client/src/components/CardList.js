import React from 'react'
import styles from './CardList.module.scss'
import PropTypes from 'prop-types'

CardList.propTypes = {
  children: PropTypes.node.isRequired,
  noGrid: PropTypes.bool,
}

export const cardListStyles = styles

export default function CardList({ children, noGrid }) {
  return (
    <div className={styles.list}>
      <div className={styles.background} />
      <div className={styles.content}>{noGrid ? children : <div className={styles.grid}>{children}</div>}</div>
    </div>
  )
}
