import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Login from './routes/Login/Login'
import RouterLoggedIn from './RouterLoggedIn'
import { userData, loadUserDataFromStorage } from './lib/user'

export function reloadApp() {
  staticReloadApp()
}
let staticReloadApp = () => {}

function App() {
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  staticReloadApp = () => setLoading(true)

  useEffect(() => {
    if (!loading) return

    loadUserDataFromStorage()
      .then(() => {
        setLoading(false)
        setLoggedIn(Boolean(userData))
      })
      .catch(() => {
        setLoading(false)
        setLoggedIn(false)
      })
  }, [loading])

  if (loading) return null
  if (!loggedIn) {
    return (
      <Router>
        <Switch>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    )
  }
  return <RouterLoggedIn />
}

export default App
