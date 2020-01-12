import React, { useEffect, useState } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'

import api from '../../lib/api'
import Monopolies from './Monopolies'
import Ranking from './Ranking'
import UserProfile from './UserProfile/UserProfile'
import AllianceProfile from './AllianceProfile'
import Contest from './Contest'

export default function RankingRouter() {
  const [contests, setContests] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get('/v1/contests')
      .then(res => {
        setContests(res.contests)
      })
      .catch(err => setError(err.message))
  }, [])
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
          <li>
            <NavLink to="/ranking/monopolies">Monopolios</NavLink>
          </li>
          {contests &&
            contests.map(contest => (
              <li key={contest.id}>
                <NavLink to={`/ranking/${contest.name}`}>{contest.name}</NavLink>
              </li>
            ))}
        </ul>
      </nav>
      {error && <h4>{error}</h4>}

      <Switch>
        <Route path="/ranking/user/:username">
          <UserProfile />
        </Route>
        <Route path="/ranking/alliance/:allianceShortName">
          <AllianceProfile />
        </Route>
        <Route path="/ranking/monopolies">
          <Monopolies />
        </Route>
        <Route path="/ranking/alliances">
          <Ranking />
        </Route>
        <Route path="/ranking/research">
          <Ranking />
        </Route>
        <Route path="/ranking/:contestName">
          <Contest />
        </Route>
        <Route path="/ranking">
          <Ranking />
        </Route>
      </Switch>
    </>
  )
}
