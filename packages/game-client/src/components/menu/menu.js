import React from 'react'

import useIsDesktop from 'lib/useIsDesktop'
import menuItems from './menu-items'
import MainMenu from './components/menu-main-menu'
import SubMenu from './components/menu-sub-menu'

export default function Menu() {
  const isDesktop = useIsDesktop()
  return (
    <>
      {!isDesktop && <SubMenu getActiveGroup={getActiveGroup} />}
      <MainMenu menuItems={menuItems} getActiveGroup={getActiveGroup} />
      {isDesktop && <SubMenu getActiveGroup={getActiveGroup} />}
    </>
  )
}

function getActiveGroup(path) {
  return menuItems.find(group => Object.values(group.items).some(item => item.path === path))
}
