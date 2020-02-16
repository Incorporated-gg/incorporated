import React from 'react'
import { logout, useAccountData } from '../../lib/user'
import Play from './Play'
import AvatarChange from './AvatarChange'
import styles from './style.module.scss'

export default function Home() {
  const accountData = useAccountData()
  if (!accountData) return null
  return (
    <div className={styles.container}>
      <h1>{accountData.username}</h1>
      <Play />
      <AvatarChange />
      <button onClick={logout}>Logout</button>
    </div>
  )
}
