import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import styles from '../logged-in/logged-in.module.scss'
import ScrollToTop from 'lib/scrollToTop'
import Login from '../../routes/login/login'

export default function LoginRouter() {
  return (
    <Router>
      <ScrollToTop />
      <div className={styles.loggedinContainer}>
        <div className={styles.contentContainer}>
          <Switch>
            <Route path="/">
              <Login />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  )
}
