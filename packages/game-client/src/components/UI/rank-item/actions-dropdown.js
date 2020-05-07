import React, { useEffect, useRef } from 'react'
import styles from './actions-dropdown.module.scss'
import PropTypes from 'prop-types'
import UserActionButtons from '../user-action-buttons/user-action-buttons'

ActionsDropdown.propTypes = {
  user: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function ActionsDropdown({ user, isOpen, onRequestClose }) {
  const containerRef = useRef()

  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const clickCallback = e => {
      if (!containerRef.current || (containerRef.current !== e.target && !containerRef.current.contains(e.target))) {
        onRequestClose()
      }
    }
    document.addEventListener('click', clickCallback)
    return () => document.removeEventListener('click', clickCallback)
  }, [isOpen, onRequestClose])

  return (
    <div ref={containerRef} className={`${styles.container} ${isOpen ? styles.open : styles.closed}`}>
      <UserActionButtons user={user} onActionClicked={onRequestClose} />
    </div>
  )
}
