import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { buildingsList } from 'shared-lib/buildingsUtils'
import styles from './monopolies.module.scss'
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
        <div className={styles.title}>Monopolios</div>
        <table>
          <tbody>
            {monopolies.map((monopoly, i) => (
              <tr key={i}>
                <td>
                  <UserLink user={monopoly.user} />
                </td>
                <td>
                  {monopoly.building_quantity.toLocaleString()}{' '}
                  {buildingsList.find(b => b.id === monopoly.building_id).name}{' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IncContainer>
  )
}
