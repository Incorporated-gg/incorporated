import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from './routes/Home/Home'
import Buildings from './routes/Buildings/Buildings'
import Research from './routes/Research/Research'
import Ranking from './routes/Ranking/Ranking'
import Alliance from './routes/Alliance/Alliance'
import Personnel from './routes/Personnel/Personnel'
import DesktopHeader from './components/DesktopHeader'
import './RouterLoggedIn.scss'

function RouterLoggedIn() {
  return (
    <Router>
      <>
        <DesktopHeader />
        <div className="loggedin-container">
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
            <Route path="/personnel">
              <Personnel />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </>
    </Router>
  )
}

export default RouterLoggedIn
