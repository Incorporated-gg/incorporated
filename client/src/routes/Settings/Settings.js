import React from 'react'
import FinancialData from './FinancialData'
import { logout } from '../../lib/user'

export default function Settings() {
  return (
    <>
      <FinancialData />
      <button type="button" onClick={logout}>
        Logout
      </button>
    </>
  )
}
