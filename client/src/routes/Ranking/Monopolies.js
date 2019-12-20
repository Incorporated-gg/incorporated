import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import { buildingsList } from 'shared-lib/buildingsUtils'

export default function Monopolies() {
  const [monopolies, setMonopolies] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get('/v1/monopolies')
      .then(res => {
        setMonopolies(res.monopolies)
      })
      .catch(err => setError(err.message))
  }, [])

  return (
    <div>
      {error && <h4>{error}</h4>}
      <h2>Monopolies</h2>
      <table>
        <thead>
          <tr>
            <th>Edificio</th>
            <th>Usuario</th>
            <th>Número de edificios</th>
          </tr>
        </thead>
        <tbody>
          {monopolies.map((monopoly, i) => (
            <tr key={i}>
              <td>{buildingsList.find(b => b.id === monopoly.building_id).name}</td>
              <td>
                <Username user={monopoly.user} />
              </td>
              <td>{monopoly.building_quantity.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
