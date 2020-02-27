import React from 'react'
import styles from './card-list.module.scss'
import PropTypes from 'prop-types'

CardList.propTypes = {
  children: PropTypes.node.isRequired,
}

export const cardListStyles = styles

export default function CardList({ children }) {
  return <div className={styles.grid}>{children}</div>
}
