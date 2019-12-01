import React, { useState, useEffect } from 'react'
import api from '../../lib/api'

export default function Ranking () {
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
      <ol>
        {ranking.length
          ? ranking.map(p => (
              <li key={p.id}>
                {p.username} - {p.income}
              </li>
            ))
          : 'No users found'}
      </ol>
    </div>
  )
}
