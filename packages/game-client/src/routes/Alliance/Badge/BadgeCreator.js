import React, { useState } from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'
import Badge from '.'

BadgeCreator.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function BadgeCreator({ alliance, reloadAllianceData }) {
  const [badge, setBadge] = useState(alliance.badge)
  const saveBadge = () => {
    api
      .post('/v1/alliance/change_badge', {
        badge,
      })
      .then(() => {
        reloadAllianceData()
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
        <select
          value={badge.shield.id}
          onChange={e => setBadge({ ...badge, shield: { ...badge.shield, id: e.target.value } })}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <input
          type="color"
          value={badge.shield.color}
          onChange={e => setBadge({ ...badge, shield: { ...badge.shield, color: e.target.value } })}
        />
      </div>
      <h4>Icono</h4>
      <div>
        <select
          value={badge.icon.id}
          onChange={e => setBadge({ ...badge, icon: { ...badge.icon, id: e.target.value } })}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <input
          type="color"
          value={badge.icon.color}
          onChange={e => setBadge({ ...badge, icon: { ...badge.icon, color: e.target.value } })}
        />
      </div>
      <div style={{ fontSize: '2.5em' }}>
        <Badge badge={badge} />
      </div>
      <br />
      <button onClick={saveBadge}>Guardar</button>
    </div>
  )
}
