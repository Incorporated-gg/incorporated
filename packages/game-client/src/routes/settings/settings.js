import React from 'react'
import AvatarChange from './avatar-change'
import { logout } from 'lib/user'
import IncButton from 'components/UI/inc-button'

export default function Settings() {
  return (
    <>
      <IncButton onClick={logout}>{'Logout'}</IncButton>
      <br />
      <br />
      <AvatarChange />
    </>
  )
}
