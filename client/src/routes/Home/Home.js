import React from 'react'
import { logout } from '../../lib/user'
import FinancialData from './FinancialData'

export default function Home() {
  return (
    <div>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <FinancialData />
    </div>
  )
}
