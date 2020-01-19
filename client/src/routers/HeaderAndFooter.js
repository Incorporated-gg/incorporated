import React from 'react'
import Username from '../components/Username'
import { NavLink } from 'react-router-dom'
import styles from './LoggedIn.module.scss'
import { useUserData } from '../lib/user'
import PropTypes from 'prop-types'

const DESKTOP_WIDTH_BREAKPOINT = 720

export function Header() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT

  if (isDesktop)
    return (
      <>
        <div style={{ top: 0 }} className={`${styles.desktopHeader} ${styles.stickyFullwidthBar}`}>
          <MoneyBar className={`${styles.moneyBar}`} />
          <Menu className={`${styles.mainMenu}`} />
        </div>
      </>
    )

  return <MoneyBar style={{ top: 0 }} className={`${styles.moneyBar} ${styles.stickyFullwidthBar}`} />
}

export function Footer() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT

  if (isDesktop) return null
  return <Menu style={{ bottom: 0 }} className={`${styles.mainMenu} ${styles.stickyFullwidthBar}`} />
}

Menu.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
}
function Menu({ className, style }) {
  return (
    <ul style={style} className={className}>
      <li>
        <NavLink to="/personnel">Personal</NavLink>
      </li>
      <li>
        <NavLink to="/buildings">Edificios</NavLink>
      </li>
      <li>
        <NavLink to="/research">Invest</NavLink>
      </li>
      <li>
        <NavLink to="/ranking">Ranking</NavLink>
      </li>
      <li>
        <NavLink to="/missions">Misiones</NavLink>
      </li>
      <li>
        <NavLink to="/alliance">Alianza</NavLink>
      </li>
      <li>
        <NavLink to="/loans">Préstamos</NavLink>
      </li>
      <li>
        <NavLink to="/messages">
          Mensajes <MessagesUnreadLabel />
        </NavLink>
      </li>
      <li>
        <NavLink to="/settings" exact>
          Opciones
        </NavLink>
      </li>
    </ul>
  )
}

MoneyBar.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
}
function MoneyBar({ className, style }) {
  const userData = useUserData()
  return (
    <div style={style} className={className}>
      <Username user={userData} />
      <div className={styles.logoContainer}>
        <img src={require('./img/logo_expanded.png')} alt="" />
      </div>
      <div className={styles.rightContainer}>
        <MoneyDisplay />
      </div>
    </div>
  )
}

function MoneyDisplay() {
  const userData = useUserData()
  if (!userData) return null

  return <span>{Math.floor(userData.money).toLocaleString()}€</span>
}

function MessagesUnreadLabel() {
  const userData = useUserData()
  if (!userData || !userData.unread_messages_count) return null
  return <span>({userData.unread_messages_count})</span>
}

function useWindowSize({ debounceMs = 100 } = {}) {
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  React.useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      })
    }, debounceMs)

    window.addEventListener('resize', debouncedHandleResize)

    return () => window.removeEventListener('resize', debouncedHandleResize)
  })
  return dimensions
}

function debounce(fn, ms) {
  let timer
  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  }
}
