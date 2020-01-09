import React, { useState, useEffect } from 'react'
import LoggedInRouter from './routers/LoggedInRouter'
import { userData, loadUserDataFromStorage } from './lib/user'
import LoginRouter from './routers/LoginRouter'

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

  return loggedIn ? <LoggedInRouter /> : <LoginRouter />
}

export default App
