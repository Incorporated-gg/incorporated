import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import Ranking from './Ranking'
import UserProfile from './UserProfile/UserProfile'
import AllianceProfile from './AllianceProfile/AllianceProfile'
import IncContainer from 'components/UI/inc-container'
import styles from './Ranking.module.scss'

export default function RankingRouter() {
  return (
    <>
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

      <Switch>
        <Route path="/ranking/user/:username">
          <UserProfile />
        </Route>
        <Route path="/ranking/alliance/:allianceShortName">
          <AllianceProfile />
        </Route>
        <Route path="/ranking/alliances">
          <Ranking />
        </Route>
        <Route path="/ranking/research">
          <Ranking />
        </Route>
        <Route path="/ranking">
          <Ranking />
        </Route>
      </Switch>
    </>
  )
}
