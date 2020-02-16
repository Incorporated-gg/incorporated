import React from 'react'
import { useUserData } from 'lib/user'
import PropTypes from 'prop-types'
import styles from './unread-count-bubble.module.scss'

UnreadCountBubble.propTypes = {
  type: PropTypes.oneOf(['messages', 'reports']),
}
export default function UnreadCountBubble({ type }) {
  const userData = useUserData()
  const count = userData[type === 'messages' ? 'unread_messages_count' : 'unread_reports_count']
  if (!count) return null

  return <span className={styles.bubble}>{count}</span>
}
