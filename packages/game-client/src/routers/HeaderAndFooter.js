import React from 'react'
import styles from './LoggedIn.module.scss'
import { useUserData, reloadUserData, logout } from '../lib/user'
import { debounce } from '../lib/utils'
import api from '../lib/api'
import MissionRow from '../routes/Messages/MissionRow'
import Menu from './Menu'
import { Link } from 'react-router-dom'
import { ReactComponent as SvgFinances } from './img/header-finances.svg'
import { ReactComponent as SvgLogout } from './img/header-logout.svg'
import { ReactComponent as SvgProfile } from './img/header-profile.svg'
import { ReactComponent as SvgNews } from './img/header-news.svg'

const DESKTOP_WIDTH_BREAKPOINT = 720

export function Header() {
  const dimensions = useWindowSize()
  const userData = useUserData()
  if (!userData) return null
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT

  return (
    <>
      <div style={{ top: 0 }} className={styles.stickyFullwidthBar}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLinks}>
            <div>
              <Link className={styles.headerButton} to="/finances">
                <SvgFinances alt={'Finanzas'} />
              </Link>
              <Link className={styles.headerButton} to="/messages">
                <SvgNews alt={'Mensajes'} />
              </Link>
            </div>
            <img className={styles.logo} src={require('./img/logo-full.png')} alt="" />
            <div>
              <div className={styles.headerButton} onClick={logout}>
                <SvgLogout alt={'Logout'} />
              </div>
              <Link className={styles.headerButton} to={`/ranking/user/${userData.username}`}>
                <SvgProfile alt={'Perfil'} />
              </Link>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.stat}>{Math.floor(userData.money).toLocaleString()}€</div>
            <div className={styles.stat}>{Math.floor(userData.money).toLocaleString()}€</div>
            <div className={styles.stat}>{Math.floor(userData.money).toLocaleString()}€</div>
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

export function Footer() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT

  if (isDesktop) return null
  return (
    <div style={{ bottom: 0 }} className={styles.stickyFullwidthBar}>
      <Menu />
    </div>
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

function Task() {
  const userData = useUserData()
  return userData.activeTasks.map(task => {
    const completeTask = () => {
      api.post('/v1/tasks/complete', { task_id: task.id }).catch(() => {})
    }

    return (
      <div key={task.id} className={styles.tutorialTask}>
        <div className={styles.tutorialInfo}>
          <p>{task.name}</p>
          <p>{task.progressPercentage} / 100%</p>
          <p>Recompensa: {task.reward.toLocaleString()}€</p>
        </div>
        <button disabled={!task.completed} onClick={completeTask}>
          Completar
        </button>
      </div>
    )
  })
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

export function useWindowSize({ debounceMs = 100 } = {}) {
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
