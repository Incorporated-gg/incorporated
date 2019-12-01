import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get('/v1/ranking')
      .then(res => {
        setRanking(res.ranking)
      })
      .catch(err => setError(err.message))
  }, [])

  return (
    <div>
      <h2>Ranking</h2>
      {error && <h4>{error}</h4>}
      <table>
        <tr>
          <th>Rank</th>
          <th>Nombre de usuario</th>
          <th>Ingresos / día</th>
        </tr>
        {ranking.length
          ? ranking.map(p => (
              <tr key={p.id}>
                <td>{p.rank_position}</td>
                <td>
                  <Username user={p} />
                </td>
                <td>{p.income}€</td>
              </tr>
            ))
          : 'No users found'}
      </table>
    </div>
  )
}
