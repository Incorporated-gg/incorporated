import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Link, useParams } from 'react-router-dom'
import Username from '../../components/Username'

export default function Ranking() {
  const { username: routeUsername } = useParams()
  const [user, setUser] = useState({})
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get('/v1/ranking/user', { username: routeUsername })
      .then(res => {
        setUser(res.user)
      })
      .catch(err => setError(err.message))
  }, [routeUsername])

  return (
    <div>
      {error && <h4>{error}</h4>}
      {user && user.id && (
        <table>
          <tbody>
            <tr>
              <td>Nombre de usuario:</td>
              <td>
                <Username user={user} />
              </td>
            </tr>
            <tr>
              <td>Posición en ranking:</td>
              <td>{user.rank_position.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Ingresos diarios:</td>
              <td>{user.income.toLocaleString()}€</td>
            </tr>
            <tr>
              <td>Acciones:</td>
              <td>
                <p>
                  <Link to={`/messages/new/${user.username}`}>Enviar mensaje</Link>
                  {' | '}
                  <Link to={`/missions/attack/${user.username}`}>Atacar</Link>
                  {' | '}
                  <Link to={`/missions/spy/${user.username}`}>Espiar</Link>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}
