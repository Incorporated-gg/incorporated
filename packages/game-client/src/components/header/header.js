import React from 'react'
import styles from './header.module.scss'
import { useUserData, logout } from 'lib/user'
import { DESKTOP_WIDTH_BREAKPOINT, numberToAbbreviation } from 'lib/utils'
import { Link } from 'react-router-dom'
import Icon from 'components/icon'
import DeclareBankruptcy from 'components/header/components/header-declare-bankruptcy'
import ActiveMission from 'components/header/components/header-active-mission'
import Task from 'components/header/components/header-task'
import useWindowSize from 'lib/useWindowSize'
import Menu from '../menu/menu'
import Container from 'components/UI/container'

export default function Header() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT

  return (
    <>
      <div style={{ top: 0 }} className={'stickyFullwidthBar'}>
        <div className={styles.container}>
          <div className={styles.headerLinks}>
            <div>
              <Link to="/finances">
                <Container outerClassName={styles.headerOuterContainer} className={styles.headerContainer}>
                  <Icon className={styles.headerIcon} svg={require('./img/finances.svg')} alt="Finances" />
                </Container>
              </Link>
              <Link to="/">
                <Container outerClassName={styles.headerOuterContainer} className={styles.headerContainer}>
                  <Icon className={styles.headerIcon} svg={require('./img/tasks.svg')} alt="Tareas" />
                </Container>
              </Link>
            </div>
            <div className={styles.logo}>
              <Icon svg={require('./img/logo.svg')} alt="" />
            </div>
            <div>
              <div onClick={logout}>
                <Container outerClassName={styles.headerOuterContainer} className={styles.headerContainer}>
                  <Icon className={styles.headerIcon} svg={require('./img/logout.svg')} alt="Logout" />
                </Container>
              </div>
              <LinkToMyProfile>
                <Container outerClassName={styles.headerOuterContainer} className={styles.headerContainer}>
                  <Icon className={styles.headerIcon} svg={require('./img/profile.svg')} alt="Perfil" />
                </Container>
              </LinkToMyProfile>
            </div>
          </div>
          <div className={styles.headerStats}>
            <Container darkBg outerClassName={styles.statContainer}>
              <div className={styles.stat}>
                <MyMoney /> <Icon iconName="money" className={styles.headerStatIcon} />
              </div>
            </Container>
            <Container darkBg outerClassName={styles.statContainer}>
              <div className={styles.stat}>
                {numberToAbbreviation(12345)} <Icon iconName="gold" className={styles.headerStatIcon} />
              </div>
            </Container>
            <Container darkBg outerClassName={styles.statContainer}>
              <div className={`${styles.stat} ${styles.statMission1}`}>
                {'3:30'} <Icon iconName="dynamite" className={styles.headerStatIcon} />
              </div>
              <div className={`${styles.stat} ${styles.statMission2}`}>+</div>
            </Container>
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

// eslint-disable-next-line react/prop-types
function LinkToMyProfile({ children }) {
  const userData = useUserData()
  if (!userData) return null

  return <Link to={`/ranking/user/${userData.username}`}>{children}</Link>
}

function MyMoney() {
  const userData = useUserData()
  if (!userData) return null

  return numberToAbbreviation(userData.money)
}
