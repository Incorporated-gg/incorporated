import React from 'react'
import PropTypes from 'prop-types'

Username.propTypes = {
  user: PropTypes.object.isRequired,
}
export default function Username({ user }) {
  return (
    <span>
      <span>{user.username}</span>
      {user.alliance && <span> [{user.alliance.short_name}]</span>}
    </span>
  )
}
