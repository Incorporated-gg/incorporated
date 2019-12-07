import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

UserActionLinks.propTypes = {
  user: PropTypes.object.isRequired,
}
export default function UserActionLinks({ user }) {
  return (
    <>
      <Link to={`/messages/new/${user.username}`}>Enviar mensaje</Link>
      {' | '}
      <Link to={`/missions/attack/${user.username}`}>Atacar</Link>
      {' | '}
      <Link to={`/missions/hack/${user.username}`}>Hackear</Link>
    </>
  )
}
