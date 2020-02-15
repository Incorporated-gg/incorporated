import React from 'react'
import { useUserData, reloadUserData } from 'lib/user'
import { post } from 'lib/api'

export default function DeclareBankruptcy() {
  const userData = useUserData()
  if (!userData || userData.money > 0) return null

  const declareBankruptcy = () => {
    post('/v1/declare_bankruptcy')
      .then(() => {
        reloadUserData()
      })
      .catch(err => alert(err.message))
  }

  return <button onClick={declareBankruptcy}>Declarar bancarrota</button>
}
