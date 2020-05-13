import React from 'react'
import { NavLink } from 'react-router-dom'
import IncContainer from 'components/UI/inc-container'
import styles from './personnel-sub-menu.module.scss'

export default function PersonnelSubMenu() {
  return (
    <IncContainer darkBg outerClassName={styles.container}>
      <div style={{ display: 'flex' }}>
        <NavLink className={styles.subMenuItem} to="/personnel/hire" exact>
          Contratar
        </NavLink>
        <NavLink className={styles.subMenuItem} to="/personnel/fire" exact>
          Despedir
        </NavLink>
      </div>
    </IncContainer>
  )
}
