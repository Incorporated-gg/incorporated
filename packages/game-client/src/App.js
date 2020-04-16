import React, { useState, useEffect } from 'react'
import LoggedInRouter from 'routers/logged-in'
import LogInPage from 'routers/log-in'
import { userData, loadUserDataFromStorage } from 'lib/user'
import ErrorBoundary from 'components/UI/ErrorBoundary'

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
        setLoggedIn(Boolean(userData))
        setLoading(false)
      })
      .catch(err => {
        alert(err.message)
        setLoggedIn(false)
        setLoading(false)
        throw err
      })
  }, [loading])

  if (loading) return null

  return <ErrorBoundary>{loggedIn ? <LoggedInRouter /> : <LogInPage />}</ErrorBoundary>
}

export default App
