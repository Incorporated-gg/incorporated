import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Home from './routes/Home/Home'
import Buildings from './routes/Buildings/Buildings'
import Research from './routes/Research/Research'
import MoneyDisplay from './components/MoneyDisplay'
import Ranking from './routes/Ranking/Ranking'
import Alliance from './routes/Alliance/Alliance'

function RouterLoggedIn() {
  return (
    <Router>
      <div>
        <nav>
          <MoneyDisplay />
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/buildings">Edificios</Link>
            </li>
            <li>
              <Link to="/research">Investigaciones</Link>
            </li>
            <li>
              <Link to="/ranking">Ranking</Link>
            </li>
            <li>
              <Link to="/alliance">Alianza</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/buildings">
            <Buildings />
          </Route>
          <Route path="/research">
            <Research />
          </Route>
          <Route path="/ranking">
            <Ranking />
          </Route>
          <Route path="/alliance">
            <Alliance />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default RouterLoggedIn
