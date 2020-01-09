import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Login from '../routes/Login/Login'
import ScrollToTop from './ScrollToTop'

export default function LoginRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Switch>
        <Route path="/">
          <Login />
        </Route>
      </Switch>
    </Router>
  )
}
