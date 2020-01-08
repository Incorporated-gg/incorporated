import React from 'react'
import { useUserData } from '../lib/user'

export default function MoneyDisplay() {
  const userData = useUserData()
  if (!userData) return null

  return <span>{Math.floor(userData.money).toLocaleString()}€</span>
}
