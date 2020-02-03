import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Header, Footer } from './HeaderAndFooter'
import styles from './LoggedIn.module.scss'
import ScrollToTop from './ScrollToTop'
import ChatBubble from '../components/ChatBubble'

import Home from '../routes/Home/Home'
import Buildings from '../routes/Buildings/Buildings'
import Research from '../routes/Research/Research'
import Ranking from '../routes/Ranking/Router'
import Alliance from '../routes/Alliance/Alliance'
import Personnel from '../routes/Personnel/Personnel'
import Messages from '../routes/Messages/Messages'
import Settings from '../routes/Settings/Settings'
import Loans from '../routes/Loans/Loans'

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
            <Route path="/settings">
              <Settings />
            </Route>
            <Route path="/loans">
              <Loans />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
        <Footer />
      </div>
      <ChatBubble />
    </Router>
  )
}
