import React, { useState, useEffect } from 'react'
import { userData } from '../lib/user'
import { calcUserMaxMoney } from 'shared-lib/researchUtils'

export default function MoneyDisplay() {
  const [, rerender] = useState()
  useEffect(() => {
    function updateMoney() {
      rerender({})
    }
    const interval = setInterval(updateMoney, 1000 / 10) // 10fps
    return () => clearInterval(interval)
  }, [])

  const maxMoney = userData ? calcUserMaxMoney(userData.researchs) : 0

  if (!userData) return null

  return (
    <span>
      {Math.floor(userData.money).toLocaleString()}€ / {maxMoney.toLocaleString()}€
    </span>
  )
}
