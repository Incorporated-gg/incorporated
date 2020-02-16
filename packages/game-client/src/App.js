import React, { useState, useEffect } from 'react'
import LoggedInRouter from 'routers/logged-in'
import LogInPage from 'routers/log-in'
import { userData, loadUserDataFromStorage, userLoggedIn } from 'lib/user'
import ErrorBoundary from 'components/ErrorBoundary'

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

    const sessionID = getQueryVariable('sessionID')
    if (sessionID) {
      userLoggedIn(sessionID)
        .then(() => {
          setLoggedIn(Boolean(userData))
          setLoading(false)
        })
        .catch(() => {
          setLoggedIn(false)
          setLoading(false)
        })
    } else {
      loadUserDataFromStorage()
        .then(() => {
          setLoggedIn(Boolean(userData))
          setLoading(false)
        })
        .catch(() => {
          setLoggedIn(false)
          setLoading(false)
        })
    }
  }, [loading])

  if (loading) return null

  return <ErrorBoundary>{loggedIn ? <LoggedInRouter /> : <LogInPage />}</ErrorBoundary>
}

export default App

function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1])
    }
  }
}
