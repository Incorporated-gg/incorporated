import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import styles from './menu-sub-menu.module.scss'
import PropTypes from 'prop-types'
import useIsDesktop from 'lib/useIsDesktop'
import useWindowSize from 'lib/useWindowSize'
import { DESKTOP_WIDTH_BREAKPOINT } from 'lib/utils'
import UnreadCountBubble from '../menu-unread-count-bubble'

const lastVisitedRoutes = {}

SubMenu.propTypes = {
  getActiveGroup: PropTypes.func.isRequired,
  getActiveItemIndex: PropTypes.func.isRequired,
}
export default function SubMenu({ getActiveGroup, getActiveItemIndex }) {
  const isDesktop = useIsDesktop()
  const windowDimensions = useWindowSize()
  const location = useLocation()

  const activeGroup = getActiveGroup(location.pathname)
  if (!activeGroup || activeGroup.items.length <= 1) return null

  const activeItemIndex = getActiveItemIndex(location.pathname, activeGroup.items)
  const markersTranslateX = (activeItemIndex + 0.5) / activeGroup.items.length
  const markersStyle = {
    transform: `translateX(${markersTranslateX * Math.min(DESKTOP_WIDTH_BREAKPOINT, windowDimensions.width)}px)`,
  }

  // Set lastVisitedRoutes
  if (!lastVisitedRoutes[activeGroup.mainPath]) lastVisitedRoutes[activeGroup.mainPath] = {}
  setTimeout(() => {
    lastVisitedRoutes[activeGroup.mainPath][activeItemIndex] = location.pathname
  }, 1)

  return (
    <div className={`${styles.subMenu} ${isDesktop ? styles.desktop : ''}`}>
      <div className={styles.subMenuMarkers} style={markersStyle} />
      {activeGroup.items.map((item, index) => {
        const extra = item.extra || []
        const isActive = activeItemIndex === index
        const link = isActive ? item.path : lastVisitedRoutes[activeGroup.mainPath][index] || item.path

        return (
          <Link className={isActive ? styles.active : ''} to={link} key={item.path}>
            <div className={styles.subMenuItem}>{item.alt}</div>
            {extra.includes('unread_messages') && <UnreadCountBubble type="messages" />}
            {extra.includes('unread_reports') && <UnreadCountBubble type="reports" />}
          </Link>
        )
      })}
    </div>
  )
}
