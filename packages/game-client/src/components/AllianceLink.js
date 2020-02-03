import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

AllianceLink.propTypes = {
  alliance: PropTypes.object,
}
export default function AllianceLink({ alliance }) {
  if (!alliance) return <span>Alianza desconocida</span>
  return <Link to={`/ranking/alliance/${alliance.short_name}`}>{alliance.long_name}</Link>
}
