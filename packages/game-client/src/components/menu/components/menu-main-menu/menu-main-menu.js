import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import styles from './menu-main-menu.module.scss'
import PropTypes from 'prop-types'
import Icon from 'components/icon'

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
        const svgIcon = group.svgIcon
        const svgText = group.svgText
        const isActive = group === activeGroup
        return (
          <Link to={group.mainPath} key={group.mainPath} className={isActive ? styles.active : ''}>
            <Icon iconName={svgIcon} className={styles.svgIcon} alt={mainPathAlt} />
            <Icon iconName={svgText} className={styles.svgText} />
          </Link>
        )
      })}
    </div>
  )
}
