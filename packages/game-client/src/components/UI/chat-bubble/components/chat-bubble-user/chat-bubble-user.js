import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styles from './chat-bubble-user.module.scss'
import AllianceBadge from 'components/alliance/alliance-badge'

ChatBubbleUser.propTypes = {
  user: PropTypes.object.isRequired,
  className: PropTypes.string,
}
export default function ChatBubbleUser({ user, className }) {
  return (
    <div className={`${styles.chatBubbleUser} ${className}`}>
      <Link className={styles.avatarLink} to={`/ranking/user/${user.username}`}>
        <img src={user.avatar} alt="" className={styles.avatar} />
      </Link>
      <AllianceBadge badge={user.alliance.badge} className={styles.badge} />
    </div>
  )
}
