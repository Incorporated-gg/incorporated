import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from '../routes/Home/Home'
import Buildings from '../routes/Buildings/Buildings'
import Research from '../routes/Research/Research'
import Ranking from '../routes/Ranking/Router'
import Alliance from '../routes/Alliance/Alliance'
import Personnel from '../routes/Personnel/Personnel'
import Missions from '../routes/Missions/Missions'
import Messages from '../routes/Messages/Messages'
import { Header, Footer } from './HeaderAndFooter'
import styles from './LoggedIn.module.scss'
import ScrollToTop from './ScrollToTop'

export default function LoggedInRouter() {
  return (
    <Router>
      <ScrollToTop />
      <div className={styles.loggedinContainer}>
        <Header />
        <div className={styles.contentContainer}>
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
            <Route path="/messages">
              <Messages />
            </Route>
            <Route path="/missions/:missionType?/:username?">
              <Missions />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
        <Footer />
      </div>
    </Router>
  )
}
