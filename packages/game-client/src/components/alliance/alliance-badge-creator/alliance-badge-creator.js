import React, { useState } from 'react'
import api from 'lib/api'
import PropTypes from 'prop-types'
import AllianceBadge from 'components/alliance/alliance-badge'
import { reloadUserData } from 'lib/user'

AllianceBadgeCreator.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceBadgeCreator({ alliance, reloadAllianceData }) {
  const [badge, setBadge] = useState(alliance.badge)
  const saveBadge = () => {
    api
      .post('/v1/alliance/change_badge', {
        badge,
      })
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <div>
      <h3>Creador de emblema</h3>
      <h4>Fondo</h4>
      <div>
        <input
          type="color"
          value={badge.backgroundColor}
          onChange={e => setBadge({ ...badge, backgroundColor: e.target.value })}
        />
      </div>
      <h4>Icono</h4>
      <div>
        <input
          type="range"
          min="1"
          max="11"
          step="1"
          value={badge.icon.id}
          onChange={e => setBadge({ ...badge, icon: { ...badge.icon, id: e.target.value } })}
        />
        <input
          type="color"
          value={badge.icon.color}
          onChange={e => setBadge({ ...badge, icon: { ...badge.icon, color: e.target.value } })}
        />
      </div>
      <AllianceBadge badge={badge} style={{ width: '4em', height: '4em', marginBottom: '1em' }} />
      <br />
      <button onClick={saveBadge}>Guardar</button>
    </div>
  )
}
