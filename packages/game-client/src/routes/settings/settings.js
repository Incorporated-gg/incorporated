import React from 'react'
import AvatarChange from './avatar-change'
import { logout } from 'lib/user'

export default function Settings() {
  return (
    <>
      <button onClick={logout}>{'Logout'}</button>
      <AvatarChange />
    </>
  )
}
