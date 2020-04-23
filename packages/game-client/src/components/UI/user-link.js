import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './user-link.module.scss'
import AllianceLink from 'components/alliance/alliance-link'

UserLink.propTypes = {
  user: PropTypes.object,
  colorScheme: PropTypes.oneOf(['light', 'dark']),
}
export default function UserLink({ user, colorScheme = 'light' }) {
  if (!user) return <span>Usuario desconocido</span>

  return (
    <span className={`${styles.container} ${(colorScheme === 'dark' && styles.darkColors) || ''}`}>
      <Link className={styles.avatarLink} to={`/ranking/user/${user.username}`}>
        <img src={user.avatar} alt="" className={styles.avatar} />
      </Link>
      <div>
        <Link className={styles.usernameLink} to={`/ranking/user/${user.username}`}>
          {user.username}
        </Link>
        {user.alliance && <AllianceLink alliance={user.alliance} type="shortNameInBraces" colorScheme={colorScheme} />}
      </div>
    </span>
  )
}
