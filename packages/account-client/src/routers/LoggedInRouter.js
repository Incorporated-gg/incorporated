import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import ScrollToTop from './ScrollToTop'

import Home from '../routes/Home/Home'

export default function LoggedInRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Switch>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  )
}
