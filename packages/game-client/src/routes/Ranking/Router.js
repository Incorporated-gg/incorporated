import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'

import Ranking from './Ranking'
import UserProfile from './UserProfile/UserProfile'
import AllianceProfile from './AllianceProfile/AllianceProfile'

export default function RankingRouter() {
  return (
    <>
      <nav className="sub-menu">
        <ul>
          <li>
            <NavLink to="/ranking" exact>
              Ingresos
            </NavLink>
          </li>
          <li>
            <NavLink to="/ranking/research" exact>
              Investigaciones
            </NavLink>
          </li>
          <li>
            <NavLink to="/ranking/alliances" exact>
              Alianzas
            </NavLink>
          </li>
        </ul>
      </nav>

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
