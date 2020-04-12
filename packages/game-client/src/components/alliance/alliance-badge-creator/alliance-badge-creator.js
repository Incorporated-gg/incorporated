import React from 'react'
import PropTypes from 'prop-types'
import AllianceBadge from 'components/alliance/alliance-badge'
import Container from 'components/UI/container'
import ColorSelection from './color-selection'

AllianceBadgeCreator.propTypes = {
  badge: PropTypes.object,
  setBadge: PropTypes.func.isRequired,
}
export default function AllianceBadgeCreator({ badge, setBadge }) {
  return (
    <Container darkBg>
      <div style={{ padding: 10 }}>
        <h4>Color Fondo</h4>
        <ColorSelection
          color={badge.backgroundColor}
          setColor={color => setBadge({ ...badge, backgroundColor: color })}
        />
        <h4>Color Icono</h4>
        <ColorSelection
          color={badge.icon.color}
          setColor={color => setBadge({ ...badge, icon: { ...badge.icon, color: color } })}
        />
        <h4>Icono</h4>
        <input
          type="range"
          min="1"
          max="11"
          step="1"
          value={badge.icon.id}
          onChange={e => setBadge({ ...badge, icon: { ...badge.icon, id: e.target.value } })}
        />
        <AllianceBadge badge={badge} style={{ width: '4em', height: '4em', marginBottom: '1em' }} />
      </div>
    </Container>
  )
}
