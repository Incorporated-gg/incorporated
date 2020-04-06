import React from 'react'
import PropTypes from 'prop-types'
import styles from './card.module.scss'

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  ribbon: PropTypes.string.isRequired,
  desc: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  colorful: PropTypes.bool,
}

export default function Card({ image, title, ribbon, desc, children, disabled = false, colorful = false }) {
  const ribbonSizeClass = ribbon.length > 2 ? (ribbon.length > 3 ? styles.moreThan3Chars : styles.moreThan2Chars) : ''
  return (
    <div className={`${styles.card} ${colorful ? styles.cardColorful : ''} ${disabled ? styles.cardDisabled : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
        <div className={`${styles.ribbon} ${ribbonSizeClass}`}>
          <span>{ribbon}</span>
        </div>
      </div>

      <div className={styles.darkBg}>
        <div className={`titleText gradient pascal ${styles.name}`}>{title}</div>
        <div className={styles.description}>{desc}</div>
        <div className={styles.children}>{children}</div>
      </div>
    </div>
  )
}
