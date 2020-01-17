import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

Username.propTypes = {
  user: PropTypes.object,
}
export default function Username({ user }) {
  if (!user) return <span>Usuario desconocido</span>
  return (
    <span>
      <Link to={`/ranking/user/${user.username}`}>{user.username}</Link>{' '}
      {user.alliance && <Link to={`/ranking/alliance/${user.alliance.short_name}`}>[{user.alliance.short_name}]</Link>}
    </span>
  )
}
