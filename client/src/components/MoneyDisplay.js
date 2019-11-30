import React, { useState, useEffect } from 'react'
import { userData } from '../lib/user'

export default function MoneyDisplay() {
  const [formattedMoney, setFormattedMoney] = useState()
  useEffect(() => {
    function updateMoney() {
      setFormattedMoney(Math.round(userData.money).toLocaleString())
    }
    const interval = setInterval(updateMoney, 1000 / 10) // 10fps
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <b>Dinero: {formattedMoney}€</b>
    </div>
  )
}
