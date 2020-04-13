import React from 'react'
import PropTypes from 'prop-types'
import AllianceBadge from 'components/alliance/alliance-badge'
import Container from 'components/UI/container'
import ColorSelection from './color-selection'
import IconSelection from './icon-selection'
import { iconComponents, backgroundComponents } from '../alliance-badge/svgComponents'
import styles from './alliance-badge-creator.module.scss'

const availableIcons = Object.entries(iconComponents).map(([index, component]) => ({
  id: parseInt(index),
  component,
}))
const availableBackgrounds = Object.entries(backgroundComponents).map(([index, component]) => ({
  id: parseInt(index),
  component,
}))

AllianceBadgeCreator.propTypes = {
  badge: PropTypes.object,
  setBadge: PropTypes.func.isRequired,
}
export default function AllianceBadgeCreator({ badge, setBadge }) {
  return (
    <Container>
      <div className={styles.container}>
        <div>
          <div className={styles.badgePreviewContainer}>
            <AllianceBadge badge={badge} className={styles.badgePreview} />
          </div>
          <div className={styles.iconsSelectionContainer}>
            <IconSelection
              icon={badge.icon.id}
              setIcon={id => setBadge({ ...badge, icon: { ...badge.icon, id: id } })}
              availableIcons={availableIcons}
            />
            <div style={{ width: 10 }} />
            <IconSelection
              icon={badge.background.id}
              setIcon={id => setBadge({ ...badge, background: { ...badge.background, id: id } })}
              availableIcons={availableBackgrounds}
            />
          </div>
        </div>
        <div className={styles.colorSelectionContainer}>
          <div className={styles.title}>COLOR ICONO</div>
          <ColorSelection
            color={badge.icon.color}
            setColor={color => setBadge({ ...badge, icon: { ...badge.icon, color: color } })}
          />
          <div className={styles.title}>COLOR PRIMARIO</div>
          <ColorSelection
            color={badge.background.color1}
            setColor={color => setBadge({ ...badge, background: { ...badge.background, color1: color } })}
          />
          <div className={styles.title}>COLOR SECUNDARIO</div>
          <ColorSelection
            color={badge.background.color2}
            setColor={color => setBadge({ ...badge, background: { ...badge.background, color2: color } })}
          />
        </div>
      </div>
    </Container>
  )
}
