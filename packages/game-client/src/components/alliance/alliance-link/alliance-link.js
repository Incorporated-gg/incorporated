import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import AllianceBadge from 'components/alliance/alliance-badge'

AllianceLink.propTypes = {
  alliance: PropTypes.object,
  type: PropTypes.oneOf(['longName', 'shortAndLongName', 'shortNameInBraces']),
}
export default function AllianceLink({ alliance, type = 'longName' }) {
  if (!alliance) return <span>Alianza desconocida</span>
  const text =
    type === 'longName'
      ? alliance.long_name
      : type === 'shortNameInBraces'
      ? `[${alliance.short_name}]`
      : `${alliance.long_name} (${alliance.short_name})`

  return (
    <Link to={`/ranking/alliance/${alliance.short_name}`}>
      <AllianceBadge badge={alliance.badge} />
      <span style={{ verticalAlign: 'middle' }}>{text}</span>
    </Link>
  )
}
