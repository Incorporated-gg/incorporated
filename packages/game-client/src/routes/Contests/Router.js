import React, { useEffect, useState } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import api from '../../lib/api'
import styles from './contests.module.scss'

import Monopolies from './Monopolies'
import Contest from './Contest'
import Container from 'components/UI/container'

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
      <Container darkBg>
        <div style={{ display: 'flex' }}>
          <NavLink className={styles.subMenuItem} to="/contests/monopolies">
            Monopolios
          </NavLink>
          {contests &&
            contests.map(contest => (
              <NavLink key={contest.id} className={styles.subMenuItem} to={`/contests/${contest.name}`}>
                {contest.name}
              </NavLink>
            ))}
        </div>
      </Container>
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
