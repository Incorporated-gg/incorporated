import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Home from './routes/Home/Home'
import Buildings from './routes/Buildings/Buildings'
import MoneyDisplay from './components/MoneyDisplay'

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
              <Link to="/buildings">Buildings</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/buildings">
            <Buildings />
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
