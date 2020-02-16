import React from 'react'
import PropTypes from 'prop-types'
import styles from './card.module.scss'

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  ribbon: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  children: PropTypes.node,
}

export default function Card({ image, title, ribbon, desc, children }) {
  const ribbonSizeClass = ribbon.length > 2 ? (ribbon.length > 3 ? styles.moreThan3Chars : styles.moreThan2Chars) : ''
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
        <div className={`${styles.ribbon} ${ribbonSizeClass}`}>
          <span>{ribbon}</span>
        </div>
      </div>

      <div className={styles.accentBg}>
        <div className={styles.name}>{title}</div>
        <div className={styles.description}>{desc}</div>
        {children}
      </div>
    </div>
  )
}
