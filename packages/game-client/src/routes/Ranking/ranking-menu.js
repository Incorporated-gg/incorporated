import React from 'react'
import { NavLink } from 'react-router-dom'
import IncContainer from 'components/UI/inc-container'
import styles from './ranking-menu.module.scss'

export default function RankingMenu() {
  return (
    <IncContainer darkBg>
      <div style={{ display: 'flex' }}>
        <NavLink className={styles.subMenuItem} to="/ranking" exact>
          Ingresos
        </NavLink>
        <NavLink className={styles.subMenuItem} to="/ranking/research" exact>
          Investigaciones
        </NavLink>
        <NavLink className={styles.subMenuItem} to="/ranking/alliances" exact>
          Corporaciones
        </NavLink>
      </div>
    </IncContainer>
  )
}
