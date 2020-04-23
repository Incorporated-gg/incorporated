import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { buildingsList } from 'shared-lib/buildingsUtils'
import styles from './contests.module.scss'
import IncContainer from 'components/UI/inc-container'
import UserLink from 'components/UI/user-link'

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
    <IncContainer darkBg>
      <div className={styles.monopolies}>
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
                  <UserLink user={monopoly.user} />
                </td>
                <td>{monopoly.building_quantity.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IncContainer>
  )
}
