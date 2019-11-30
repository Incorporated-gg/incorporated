import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Login from './routes/Login/Login'
import Home from './routes/Home/Home'
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
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/users">
            <Users />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

function About() {
  return <h2>About</h2>
}

function Users() {
  return <h2>Users</h2>
}

export default App
