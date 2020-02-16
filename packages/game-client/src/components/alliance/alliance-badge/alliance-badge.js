import React from 'react'
import PropTypes from 'prop-types'
import styles from './alliance-badge.module.scss'
import { ReactComponent as Icon1 } from './icons/1.svg'
import { ReactComponent as Icon2 } from './icons/2.svg'
import { ReactComponent as Icon3 } from './icons/3.svg'
import { ReactComponent as Icon4 } from './icons/4.svg'
import { ReactComponent as Icon5 } from './icons/5.svg'
import { ReactComponent as Icon6 } from './icons/6.svg'
import { ReactComponent as Icon7 } from './icons/7.svg'
import { ReactComponent as Icon8 } from './icons/8.svg'
import { ReactComponent as Icon9 } from './icons/9.svg'
import { ReactComponent as Icon10 } from './icons/10.svg'
import { ReactComponent as Icon11 } from './icons/11.svg'

const iconComponents = {
  1: Icon1,
  2: Icon2,
  3: Icon3,
  4: Icon4,
  5: Icon5,
  6: Icon6,
  7: Icon7,
  8: Icon8,
  9: Icon9,
  10: Icon10,
  11: Icon11,
}

AllianceBadge.propTypes = {
  badge: PropTypes.object.isRequired,
}
export default function AllianceBadge({ badge }) {
  // Background
  const bgStyle = {
    backgroundColor: badge.backgroundColor,
  }

  // Icon
  const IconComponent = iconComponents[badge.icon.id]
  const iconStyle = {}
  if (badge.icon && badge.icon.color) iconStyle.color = badge.icon.color

  return (
    <span className={styles.container} style={bgStyle}>
      <IconComponent className={styles.icon} style={iconStyle} />
    </span>
  )
}
