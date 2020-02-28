import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import styles from './menu-main-menu.module.scss'
import PropTypes from 'prop-types'
import Icon from 'components/icon'
import UnreadCountBubble from '../menu-unread-count-bubble'

const lastVisitedRoutes = {}

MainMenu.propTypes = {
  menuItems: PropTypes.array.isRequired,
  getActiveGroup: PropTypes.func.isRequired,
}
export default function MainMenu({ menuItems, getActiveGroup }) {
  const location = useLocation()
  const activeGroup = getActiveGroup(location.pathname)

  // Set lastVisitedRoutes
  setTimeout(() => {
    if (!activeGroup) return
    lastVisitedRoutes[activeGroup.mainPath] = location.pathname
  }, 1)

  return (
    <div className={styles.mainMenu}>
      {menuItems.map(group => {
        const mainPathAlt = group.items.find(item => item.path === group.mainPath).alt
        const isActive = group === activeGroup
        const extra = group.extra || []
        const link = isActive ? group.mainPath : lastVisitedRoutes[group.mainPath] || group.mainPath

        return (
          <Link key={group.mainPath} to={link} className={isActive ? styles.active : ''}>
            <Icon svg={group.svgIcon} className={styles.svgIcon} alt={mainPathAlt} />
            <div className={styles.titleContainer}>
              <span className={`titleText shadow pascal ${styles.title}`}>{group.title}</span>
              {extra.includes('unread_messages') && <UnreadCountBubble type="messages" />}
              {extra.includes('unread_reports') && <UnreadCountBubble type="reports" />}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
