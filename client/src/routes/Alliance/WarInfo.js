import React from 'react'
import PropTypes from 'prop-types'
import AllianceLink from '../../components/AllianceLink'

WarInfo.propTypes = {
  war: PropTypes.object.isRequired,
}
export default function WarInfo({ war }) {
  return (
    <div>
      <h2>
        <AllianceLink alliance={war.combatant} />
      </h2>
      <p>Se declaró el {new Date(war.created_at * 1000).toLocaleString()}</p>
      {war.data ? (
        <pre>{JSON.stringify(war.data, null, 2)}</pre>
      ) : (
        <div>La guerra se ha declarado hoy y comenzará mañana</div>
      )}
    </div>
  )
}
