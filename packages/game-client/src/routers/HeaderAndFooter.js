import React from 'react'
import Username from '../components/Username'
import { NavLink } from 'react-router-dom'
import styles from './LoggedIn.module.scss'
import { useUserData, reloadUserData } from '../lib/user'
import { debounce } from '../lib/utils'
import PropTypes from 'prop-types'
import api from '../lib/api'
import MissionRow from '../routes/Messages/MissionRow'

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
          <ActiveMission />
        </div>
        <TutorialTask />
      </>
    )

  return (
    <>
      <MoneyBar style={{ top: 0 }} className={`${styles.moneyBar} ${styles.stickyFullwidthBar}`} />
      <ActiveMission />
      <TutorialTask />
    </>
  )
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

function ActiveMission() {
  const userData = useUserData()
  if (!userData.active_mission) return null

  return (
    <div className={styles.activeMission}>
      <h1>Misión activa</h1>
      <table>
        <tbody>
          <MissionRow mission={userData.active_mission} reloadMissionsCallback={reloadUserData} />
        </tbody>
      </table>
    </div>
  )
}

function TutorialTask() {
  const userData = useUserData()
  if (!userData.tutorialTask) return null
  const completeTask = () => {
    api.post('/v1/tutorial_tasks/complete').catch(() => {})
  }

  return (
    <div className={styles.tutorialTask}>
      <div className={styles.tutorialInfo}>
        <p>{userData.tutorialTask.name}</p>
        <p>{userData.tutorialTask.progressPercentage} / 100%</p>
        <p>Recompensa: {userData.tutorialTask.reward.toLocaleString()}€</p>
      </div>
      <button disabled={!userData.tutorialTask.completed} onClick={completeTask}>
        Completar
      </button>
    </div>
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
        <DeclareBankruptcy />
      </div>
    </div>
  )
}

function MoneyDisplay() {
  const userData = useUserData()
  if (!userData) return null

  return <span>{Math.floor(userData.money).toLocaleString()}€</span>
}

function DeclareBankruptcy() {
  const userData = useUserData()
  if (!userData || userData.money > 0) return null

  const declareBankruptcy = () => {
    api
      .post('/v1/declare_bankruptcy')
      .then(() => {
        reloadUserData()
      })
      .catch(err => alert(err.message))
  }

  return <button onClick={declareBankruptcy}>Declarar bancarrota</button>
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
