import React, { useRef, useCallback, useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import styles from './menu-sub-menu.module.scss'
import PropTypes from 'prop-types'
import useIsDesktop from 'lib/useIsDesktop'
import UnreadCountBubble from '../menu-unread-count-bubble'

const lastVisitedRoutes = {}

SubMenu.propTypes = {
  activeGroup: PropTypes.object.isRequired,
  activeItemIndex: PropTypes.number.isRequired,
}
export default function SubMenu({ activeGroup, activeItemIndex }) {
  const linkRefs = useRef({})
  const isDesktop = useIsDesktop()
  const location = useLocation()
  const [markersStyle, setMarkersStyle] = useState({})

  const reloadMarkerTransform = useCallback(() => {
    const itemElm = linkRefs.current[activeItemIndex]
    const translateX = itemElm.offsetLeft + itemElm.clientWidth / 2
    setMarkersStyle({
      transform: `translateX(${translateX}px)`,
    })
  }, [activeItemIndex])

  useEffect(() => {
    reloadMarkerTransform()
  }, [activeGroup, reloadMarkerTransform])

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
          <Link
            ref={ref => (linkRefs.current[index] = ref)}
            className={isActive ? styles.active : ''}
            to={link}
            key={item.path}>
            <div className={styles.subMenuItem}>{item.alt}</div>
            {extra.includes('unread_messages') && <UnreadCountBubble type="messages" />}
            {extra.includes('unread_reports') && <UnreadCountBubble type="reports" />}
          </Link>
        )
      })}
    </div>
  )
}
