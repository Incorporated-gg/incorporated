import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import UserActionLinks from '../../components/UserActionLinks'
import { Link, useLocation } from 'react-router-dom'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [error, setError] = useState(false)
  const { pathname } = useLocation()
  let type = pathname.split('/').pop()
  if (type === 'ranking') type = 'income'

  useEffect(() => {
    api
      .get('/v1/ranking', { type })
      .then(res => {
        setRanking(res.ranking)
      })
      .catch(err => setError(err.message))
  }, [type])

  return (
    <div>
      <h2>Ranking</h2>
      {error && <h4>{error}</h4>}
      <table>
        <thead>
          <tr>
            <th>Posición</th>
            <th>Nombre</th>
            <th>{type === 'income' ? 'Ingresos diarios' : 'Puntos'}</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ranking.length ? (
            ranking.map(rankItem => (
              <tr key={rankItem.rank}>
                <td>{rankItem.rank.toLocaleString()}</td>
                <td>
                  {rankItem.user && <Username user={rankItem.user} />}
                  {rankItem.alliance && (
                    <span>
                      {rankItem.alliance.long_name} ({rankItem.alliance.short_name})
                    </span>
                  )}
                </td>
                <td>
                  {rankItem.points.toLocaleString()}
                  {type === 'income' ? '€' : ''}
                </td>
                <td>
                  {rankItem.user && <UserActionLinks user={rankItem.user} />}{' '}
                  {rankItem.alliance && <Link to={`/ranking/alliance/${rankItem.alliance.id}`}>Ver perfil</Link>}
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
