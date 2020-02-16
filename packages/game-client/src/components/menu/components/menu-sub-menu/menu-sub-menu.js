import React from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import styles from './menu-sub-menu.module.scss'
import PropTypes from 'prop-types'
import useIsDesktop from 'lib/useIsDesktop'
import useWindowSize from 'lib/useWindowSize'
import { DESKTOP_WIDTH_BREAKPOINT } from 'lib/utils'
import UnreadCountBubble from '../unread-count-bubble'

SubMenu.propTypes = {
  getActiveGroup: PropTypes.func.isRequired,
}
export default function SubMenu({ getActiveGroup }) {
  const isDesktop = useIsDesktop()
  const windowDimensions = useWindowSize()
  const location = useLocation()

  const activeGroup = getActiveGroup(location.pathname)
  if (!activeGroup || activeGroup.items.length <= 1) return null

  const activeItemIndex = activeGroup.items.findIndex(item => item.path === location.pathname)
  const markersTranslateX = (activeItemIndex + 0.5) / activeGroup.items.length
  const markersStyle = {
    transform: `translateX(${markersTranslateX * Math.min(DESKTOP_WIDTH_BREAKPOINT, windowDimensions.width)}px)`,
  }

  return (
    <div className={`${styles.subMenu} ${isDesktop ? styles.desktop : ''}`}>
      <div className={styles.subMenuMarkers} style={markersStyle} />
      {activeGroup.items.map(item => {
        const extra = item.extra || []
        return (
          <NavLink exact to={item.path} key={item.path}>
            <div className={styles.subMenuItem}>{item.alt}</div>
            {extra.includes('unread_messages') && <UnreadCountBubble type="messages" />}
            {extra.includes('unread_reports') && <UnreadCountBubble type="reports" />}
          </NavLink>
        )
      })}
    </div>
  )
}
