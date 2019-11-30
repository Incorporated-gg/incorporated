import React from 'react'
import { logout } from '../../lib/user'

export default function Home() {
  return (
    <div>
      <h2>Home</h2>
      <a href="#" onClick={logout}>
        Logout
      </a>
    </div>
  )
}
