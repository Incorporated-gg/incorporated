import React from 'react'
import PropTypes from 'prop-types'
import styles from './card.module.scss'

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  accentColor: PropTypes.string.isRequired,
  children: PropTypes.node,
}

export default function Card({ image, title, subtitle, desc, accentColor, children }) {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.card}>
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
        <div className={styles.name}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
        <div className={styles.description}>{desc}</div>

        <div className={styles.accentBg} style={{ backgroundColor: accentColor }}>
          {children}
        </div>
      </div>
    </div>
  )
}
