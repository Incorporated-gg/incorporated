import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import styles from './menu-main-menu.module.scss'
import PropTypes from 'prop-types'
import Icon from 'components/icon'
import UnreadCountBubble from '../menu-unread-count-bubble'

MainMenu.propTypes = {
  menuItems: PropTypes.array.isRequired,
  getActiveGroup: PropTypes.func.isRequired,
}
export default function MainMenu({ menuItems, getActiveGroup }) {
  const location = useLocation()
  const activeGroup = getActiveGroup(location.pathname)

  return (
    <div className={styles.mainMenu}>
      {menuItems.map(group => {
        const mainPathAlt = group.items.find(item => item.path === group.mainPath).alt
        const isActive = group === activeGroup
        const extra = group.extra || []
        return (
          <Link to={group.mainPath} key={group.mainPath} className={isActive ? styles.active : ''}>
            <Icon svg={group.svgIcon} className={styles.svgIcon} alt={mainPathAlt} />
            <div>
              <Icon svg={group.svgText} className={styles.svgText} />
              {extra.includes('unread_messages') && <UnreadCountBubble type="messages" />}
              {extra.includes('unread_reports') && <UnreadCountBubble type="reports" />}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
