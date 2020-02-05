import React from 'react'
import PropTypes from 'prop-types'
import styles from './Badge.module.scss'
import { ReactComponent as Shield1 } from './shields/1.svg'
import { ReactComponent as Shield2 } from './shields/2.svg'
import { ReactComponent as Shield3 } from './shields/3.svg'
import { ReactComponent as Shield4 } from './shields/4.svg'
import { ReactComponent as Shield5 } from './shields/5.svg'
import { ReactComponent as Icon1 } from './icons/1.svg'
import { ReactComponent as Icon2 } from './icons/2.svg'
import { ReactComponent as Icon3 } from './icons/3.svg'
import { ReactComponent as Icon4 } from './icons/4.svg'
const shieldComponents = {
  1: Shield1,
  2: Shield2,
  3: Shield3,
  4: Shield4,
  5: Shield5,
}
const iconComponents = {
  1: Icon1,
  2: Icon2,
  3: Icon3,
  4: Icon4,
}

Badge.propTypes = {
  badge: PropTypes.object.isRequired,
}
export default function Badge({ badge }) {
  // Shield
  const shieldStyle = {}
  const ShieldComponent = shieldComponents[badge.shield.id]
  if (badge.shield && badge.shield.color) shieldStyle.color = badge.shield.color

  // Icon
  const IconComponent = iconComponents[badge.icon.id]
  const iconStyle = {}
  if (badge.icon && badge.icon.color) iconStyle.color = badge.icon.color

  return (
    <span className={styles.container}>
      <ShieldComponent className={styles.shield} style={shieldStyle} />
      <IconComponent className={styles.icon} style={iconStyle} />
    </span>
  )
}
