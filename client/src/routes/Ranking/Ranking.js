import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import { Link } from 'react-router-dom'

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
        <thead>
          <tr>
            <th>Rank</th>
            <th>Nombre de usuario</th>
            <th>Ingresos / día</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ranking.length ? (
            ranking.map(user => (
              <tr key={user.id}>
                <td>{user.rank_position.toLocaleString()}</td>
                <td>
                  <Username user={user} />
                </td>
                <td>{user.income.toLocaleString()}€</td>
                <td>
                  <Link to={`/messages/new/${user.username}`}>Enviar mensaje</Link>
                  <Link to={`/missions/attack/${user.username}`}>Atacar</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td>No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
