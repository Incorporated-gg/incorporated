import React from 'react'
import styles from './header.module.scss'
import { useUserData, logout } from 'lib/user'
import { DESKTOP_WIDTH_BREAKPOINT } from 'lib/utils'
import { Link } from 'react-router-dom'
import Icon from 'components/icon'
import DeclareBankruptcy from 'components/header/components/header-declare-bankruptcy'
import ActiveMission from 'components/header/components/header-active-mission'
import Task from 'components/header/components/header-task'
import useWindowSize from 'lib/useWindowSize'
import Menu from '../menu/menu'

export default function Header() {
  const dimensions = useWindowSize()
  const userData = useUserData()
  if (!userData) return null
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT

  return (
    <>
      <div style={{ top: 0 }} className={'stickyFullwidthBar'}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLinks}>
            <div>
              <Link className={styles.headerButton} to="/finances">
                <Icon className={styles.headerIcon} svg={require('./img/finances.svg')} alt="Finances" />
              </Link>
              <Link className={styles.headerButton} to="/">
                <Icon className={styles.headerIcon} svg={require('./img/tasks.svg')} alt="Tareas" />
              </Link>
            </div>
            <div className={styles.logo}>
              <Icon svg={require('./img/logo.svg')} alt="" />
            </div>
            <div>
              <div className={styles.headerButton} onClick={logout}>
                <Icon className={styles.headerIcon} svg={require('./img/logout.svg')} alt="Logout" />
              </div>
              <Link className={styles.headerButton} to={`/ranking/user/${userData.username}`}>
                <Icon className={styles.headerIcon} svg={require('./img/profile.svg')} alt="Perfil" />
              </Link>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              {Math.floor(userData.money).toLocaleString()} <Icon iconName="money" className={styles.headerStatIcon} />
            </div>
            <div className={styles.stat}>
              {Math.floor(userData.money).toLocaleString()} <Icon iconName="money" className={styles.headerStatIcon} />
            </div>
            <div className={styles.stat}>
              {Math.floor(userData.money).toLocaleString()} <Icon iconName="money" className={styles.headerStatIcon} />
            </div>
          </div>
          <DeclareBankruptcy />
        </div>
        {isDesktop && <Menu />}
      </div>
      <ActiveMission />
      <Task />
    </>
  )
}