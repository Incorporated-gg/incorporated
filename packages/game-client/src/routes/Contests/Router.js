import React, { useEffect, useState } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import api from '../../lib/api'

import Monopolies from './Monopolies'
import Contest from './Contest'

export default function ContestsRouter() {
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
            <NavLink to="/contests/monopolies">Monopolios</NavLink>
          </li>
          {contests &&
            contests.map(contest => (
              <li key={contest.id}>
                <NavLink to={`/contests/${contest.name}`}>{contest.name}</NavLink>
              </li>
            ))}
        </ul>
      </nav>
      <br />
      {error && <h4>{error}</h4>}

      <Switch>
        <Route path="/contests/monopolies">
          <Monopolies />
        </Route>
        <Route path="/contests/:contestName">
          <Contest />
        </Route>
        <Route path="/contests">
          <Monopolies />
        </Route>
      </Switch>
    </>
  )
}
