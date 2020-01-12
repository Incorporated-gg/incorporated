import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styles from './UserActionLinks.module.scss'
import { useUserData } from '../lib/user'

UserActionLinks.propTypes = {
  user: PropTypes.object.isRequired,
}
export default function UserActionLinks({ user }) {
  const userData = useUserData()
  const isMe = userData.id === user.id
  const shareAlliance = isMe || (userData.alliance && user.alliance && userData.alliance.id === user.alliance.id)
  return (
    <>
      <Link className={styles.button} to={`/messages/new/${user.username}`} disabled={isMe}>
        Enviar mensaje
      </Link>
      <Link className={styles.button} to={`/missions/attack/${user.username}`} disabled={shareAlliance}>
        Atacar
      </Link>

      <Link className={styles.button} to={`/missions/spy/${user.username}`} disabled={isMe}>
        Espiar
      </Link>
    </>
  )
}
