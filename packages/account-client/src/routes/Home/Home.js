import React from 'react'
import { logout, useUserData } from '../../lib/user'
import Play from './Play'
import styles from './style.module.scss'

export default function Home() {
  const userData = useUserData()
  return (
    <div className={styles.container}>
      <h1>{userData.username}</h1>
      <Play />
      <button onClick={logout}>Logout</button>
    </div>
  )
}
