import React, { useState, useEffect } from 'react'
import LoggedInRouter from 'routers/logged-in'
import LogInPage from 'routers/log-in'
import { userData, loadUserDataFromStorage } from 'lib/user'
import ErrorBoundary from 'components/UI/ErrorBoundary'
import { useTracking } from 'lib/useTracking'

export function reloadApp() {
  staticReloadApp()
}
let staticReloadApp = () => {}

function App() {
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  staticReloadApp = () => setLoading(true)

  useEffect(() => {
    // Change when translations are introduced
    document.body.lang = 'es'
  }, [])

  useTracking()

  useEffect(() => {
    if (!loading) return

    removeLoadingScreenDiv()

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

function removeLoadingScreenDiv() {
  const loadingDiv = document.getElementById('loadingScreen')
  if (!loadingDiv) return

  setTimeout(() => {
    const animationMs = 300
    loadingDiv.style.transition = `opacity ${animationMs}ms linear`
    loadingDiv.style.opacity = 0
    setTimeout(() => {
      loadingDiv.remove()
    }, animationMs)
  }, 500)
}
