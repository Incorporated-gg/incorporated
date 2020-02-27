import React from 'react'

import useIsDesktop from 'lib/useIsDesktop'
import menuItems from './menu-items'
import MainMenu from './components/menu-main-menu'
import SubMenu from './components/menu-sub-menu'

export default function Menu() {
  const isDesktop = useIsDesktop()
  return (
    <>
      {!isDesktop && <SubMenu getActiveGroup={getActiveGroup} getActiveItemIndex={getActiveItemIndex} />}
      <MainMenu menuItems={menuItems} getActiveGroup={getActiveGroup} />
      {isDesktop && <SubMenu getActiveGroup={getActiveGroup} getActiveItemIndex={getActiveItemIndex} />}
    </>
  )
}

function getActiveItemIndex(path, activeGroupItems) {
  const activeItemIndex = activeGroupItems.findIndex(item => {
    if (item.path === path) return true
    if (item.alternativePaths) {
      return item.alternativePaths.some(alternativePath => {
        if (alternativePath instanceof RegExp) {
          return alternativePath.test(path)
        }
        return alternativePath === path
      })
    }
    return false
  })
  return activeItemIndex
}

function getActiveGroup(path) {
  return menuItems.find(group => {
    const activeGroupItems = Object.values(group.items)
    const activeItemIndex = getActiveItemIndex(path, activeGroupItems)
    return activeItemIndex !== -1
  })
}
