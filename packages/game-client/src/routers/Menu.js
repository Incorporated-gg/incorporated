import React from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import styles from './Menu.module.scss'
import { ReactComponent as SvgTextInversion } from './menu_img/text-inversion.svg'
import { ReactComponent as SvgTextMap } from './menu_img/text-mapa.svg'
import { ReactComponent as SvgTextMissions } from './menu_img/text-misiones.svg'
import { ReactComponent as SvgTextNewspaper } from './menu_img/text-periodico.svg'
import { ReactComponent as SvgTextCorporation } from './menu_img/text-corporacion.svg'
import { ReactComponent as SvgIconInversions } from './menu_img/icon-inversion.svg'
import { ReactComponent as SvgIconMissions } from './menu_img/icon-missions.svg'
import { useWindowSize } from './HeaderAndFooter'

const menuGroups = [
  {
    mainPath: '/ranking',
    svgIcon: SvgIconMissions,
    svgText: SvgTextMissions,
    items: [
      {
        path: '/ranking',
        alt: 'Ranking',
      },
      {
        path: '/ranking/monopolies',
        alt: 'Competiciones',
      },
      {
        path: '/personnel',
        alt: 'Personal',
      },
      {
        path: '/reports',
        alt: 'Reportes',
      },
    ],
  },
  {
    mainPath: '/newspaper',
    svgIcon: SvgIconInversions,
    svgText: SvgTextNewspaper,
    items: [
      {
        path: '/newspaper',
        alt: 'Periódico',
      },
      {
        path: '/messages',
        alt: 'Mensajes',
      },
    ],
  },
  {
    mainPath: '/buildings',
    svgIcon: SvgIconInversions,
    svgText: SvgTextInversion,
    items: [
      {
        path: '/buildings',
        alt: 'Edificios',
      },
      {
        path: '/research',
        alt: 'Investigación',
      },
      {
        path: '/loans',
        alt: 'Préstamos',
      },
      {
        path: '/finances',
        alt: 'Finanzas',
      },
    ],
  },
  {
    mainPath: '/alliance',
    svgIcon: SvgIconInversions,
    svgText: SvgTextCorporation,
    items: [
      {
        path: '/alliance',
        alt: 'Inicio',
      },
      {
        path: '/alliance/resources',
        alt: 'Recursos',
      },
      {
        path: '/alliance/research',
        alt: 'Investigaciones',
      },
      {
        path: '/alliance/missions',
        alt: 'Misiones',
      },
      {
        path: '/alliance/wars',
        alt: 'Guerras',
      },
      {
        path: '/alliance/admin',
        alt: 'Admin',
      },
    ],
  },
  {
    mainPath: '/map',
    svgIcon: SvgIconInversions,
    svgText: SvgTextMap,
    items: [
      {
        path: '/map',
        alt: 'Mapa',
      },
    ],
  },
]

export default function Menu() {
  const isDesktop = useIsDesktop()
  return (
    <>
      {!isDesktop && <SubMenu />}
      <MainMenu />
      {isDesktop && <SubMenu />}
    </>
  )
}

function MainMenu() {
  const location = useLocation()
  const activeGroup = getActiveGroup(location.pathname)

  return (
    <div className={styles.mainMenu}>
      {menuGroups.map(group => {
        const mainPathAlt = group.items.find(item => item.path === group.mainPath).alt
        const SvgIcon = group.svgIcon
        const SvgText = group.svgText
        const isActive = group === activeGroup
        return (
          <Link to={group.mainPath} key={group.mainPath} className={isActive ? styles.active : ''}>
            <SvgIcon className={styles.svgIcon} alt={mainPathAlt} />
            <SvgText className={styles.svgText} alt="" />
          </Link>
        )
      })}
    </div>
  )
}

function SubMenu() {
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
        return (
          <NavLink exact to={item.path} key={item.path}>
            <div className={styles.subMenuItem}>{item.alt}</div>
          </NavLink>
        )
      })}
    </div>
  )
}

function getActiveGroup(path) {
  const activeGroup = menuGroups.find(group => Object.values(group.items).some(item => item.path === path))

  return activeGroup
}

const DESKTOP_WIDTH_BREAKPOINT = 720
function useIsDesktop() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT
  return isDesktop
}
