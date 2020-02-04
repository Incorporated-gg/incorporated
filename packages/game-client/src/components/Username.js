import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './Username.module.scss'

Username.propTypes = {
  user: PropTypes.object,
}
export default function Username({ user }) {
  if (!user) return <span>Usuario desconocido</span>
  return (
    <span className={styles.container}>
      {user.accountData && (
        <Link className={styles.avatarLink} to={`/ranking/user/${user.username}`}>
          <img src={user.accountData.avatar} alt="" className={styles.avatar} />
        </Link>
      )}
      <Link className={styles.usernameLink} to={`/ranking/user/${user.username}`}>
        {user.username}
      </Link>
      {user.alliance && <Link to={`/ranking/alliance/${user.alliance.short_name}`}>[{user.alliance.short_name}]</Link>}
    </span>
  )
}
