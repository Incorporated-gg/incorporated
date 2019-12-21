import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

Username.propTypes = {
  user: PropTypes.object.isRequired,
}
export default function Username({ user }) {
  if (!user) return null
  return (
    <span>
      <Link to={`/ranking/user/${user.username}`}>{user.username}</Link>{' '}
      {user.alliance && <Link to={`/ranking/alliance/${user.alliance.short_name}`}>[{user.alliance.short_name}]</Link>}
    </span>
  )
}
