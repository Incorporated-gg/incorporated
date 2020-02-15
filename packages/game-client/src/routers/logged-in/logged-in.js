import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Header from '../../components/header'
import Footer from '../../components/footer'
import styles from './logged-in.module.scss'
import ScrollToTop from 'lib/scrollToTop'
import ChatBubble from 'components/ChatBubble'

import Home from 'routes/home'
import Buildings from 'routes/Buildings/Buildings'
import Research from 'routes/Research/Research'
import Ranking from 'routes/Ranking/Router'
import Alliance from 'routes/Alliance/Alliance'
import Personnel from 'routes/Personnel/Personnel'
import Messages from 'routes/Messages/Messages'
import Finances from 'routes/Finances/Finances'
import Loans from 'routes/loans'
import Map from 'routes/Map/Map'
import Newspaper from 'routes/Newspaper/Newspaper'
import Reports from 'routes/Reports/Reports'

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
            <Route path="/finances">
              <Finances />
            </Route>
            <Route path="/loans">
              <Loans />
            </Route>
            <Route path="/map">
              <Map />
            </Route>
            <Route path="/newspaper">
              <Newspaper />
            </Route>
            <Route path="/reports">
              <Reports />
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
