import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import ChatState from 'context/ChatState'

import Header from 'components/header'
import Footer from 'components/footer'
import styles from '../style.module.scss'
import ScrollToTop from 'lib/scrollToTop'
import ChatBubble from 'components/UI/chat-bubble'
import ErrorBoundary from 'components/UI/ErrorBoundary'

import Home from 'routes/home'
import Buildings from 'routes/Buildings/Buildings'
import Research from 'routes/Research/Research'
import Ranking from 'routes/Ranking/Router'
import Contest from 'routes/contest'
import Alliance from 'routes/alliance/alliance'
import Personnel from 'routes/Personnel/Personnel'
import Messages from 'routes/Messages/Messages'
import Finances from 'routes/Finances/Finances'
import Map from 'routes/Map/Map'
import Newspaper from 'routes/Newspaper/Newspaper'
import Reports from 'routes/Reports/Reports'
import Settings from 'routes/settings/settings'
import Monopolies from 'routes/monopolies/monopolies'
import Shop from 'routes/shop/shop'

export default function LoggedInRouter() {
  return (
    <ChatState>
      <Router>
        <ScrollToTop />
        <div className={`${styles.pageContainer} ${styles.loggedIn}`}>
          <Header />
          <div className={styles.contentContainer}>
            <ErrorBoundary>
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
                <Route path="/monopolies">
                  <Monopolies />
                </Route>
                <Route path="/contest">
                  <Contest />
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
                <Route path="/map">
                  <Map />
                </Route>
                <Route path="/newspaper">
                  <Newspaper />
                </Route>
                <Route path="/reports">
                  <Reports />
                </Route>
                <Route path="/settings">
                  <Settings />
                </Route>
                <Route path="/shop">
                  <Shop />
                </Route>
                <Route path="/">
                  <Home />
                </Route>
              </Switch>
            </ErrorBoundary>
          </div>
          <Footer />
        </div>
        <ChatBubble />
      </Router>
    </ChatState>
  )
}
