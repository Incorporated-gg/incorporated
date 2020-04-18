import React, { useState } from 'react'
import styles from './header.module.scss'
import { DESKTOP_WIDTH_BREAKPOINT } from 'lib/utils'
import ActiveMission from 'components/header/components/header-active-mission'
import ActiveTasksModal from 'components/header/components/active-tasks-modal'
import useWindowSize from 'lib/useWindowSize'
import Menu from '../menu/menu'
import AccountAviAndLvl from './components/account-avi-and-lvl/account-avi-and-lvl'
import MoneyAndGold from './components/money-and-gold/money-and-gold'
import HeaderRightButtons from './components/header-right-buttons/header-right-buttons'

export default function Header() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT
  const [isActiveTasksModalOpen, setIsActiveTasksModalOpen] = useState(false)

  return (
    <>
      <div className={styles.sticky}>
        <div className={styles.container}>
          <div className={styles.mainHeader}>
            <AccountAviAndLvl />
            <MoneyAndGold />
            <HeaderRightButtons setIsActiveTasksModalOpen={setIsActiveTasksModalOpen} />
          </div>
          <div className={styles.containerBottomBorder} />
        </div>
        {isDesktop && <Menu />}
        <ActiveMission />
      </div>

      <ActiveTasksModal isOpen={isActiveTasksModalOpen} onRequestClose={() => setIsActiveTasksModalOpen(false)} />
    </>
  )
}
