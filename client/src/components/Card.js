import React from 'react'
import PropTypes from 'prop-types'
import styles from './Card.module.scss'

export const cardStyles = styles

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  accentColor: PropTypes.string.isRequired,
  children: PropTypes.node,
}

export default Card
export function Card({ image, title, subtitle, desc, accentColor, children }) {
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

Stat.propTypes = {
  img: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
}
export function Stat({ img, title, value }) {
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
