import React from 'react'
import PropTypes from 'prop-types'
import styles from './card.module.scss'

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  ribbon: PropTypes.string.isRequired,
  children: PropTypes.node,
  disabled: PropTypes.bool,
}

export default function Card({ image, title, ribbon, children, disabled = false }) {
  const ribbonSizeClass = ribbon.length > 2 ? styles.moreThan2Chars : ''
  return (
    <div className={`${styles.card} ${disabled ? styles.cardDisabled : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
        <div className={`${styles.ribbon} ${ribbonSizeClass}`}>{ribbon}</div>
      </div>

      <div className={styles.darkBg}>
        <div className={styles.name}>{title}</div>
        <div className={styles.children}>{children}</div>
      </div>
    </div>
  )
}
