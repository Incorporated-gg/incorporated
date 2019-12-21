import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import UserActionLinks from '../../components/UserActionLinks'
import { useParams } from 'react-router-dom'
import { useUserData } from '../../lib/user'

export default function Ranking() {
  const { allianceShortName } = useParams()
  const [alliance, setAlliance] = useState({})
  const [error, setError] = useState(false)
  const userData = useUserData()

  useEffect(() => {
    api
      .get(`/v1/ranking/alliance/${allianceShortName}`)
      .then(res => {
        setAlliance(res.alliance)
      })
      .catch(err => setError(err.message))
  }, [allianceShortName])

  const createMemberRequest = () => {
    api
      .post('/v1/alliance/member_request/create', { alliance_id: alliance.id })
      .then(() => alert('Petición enviada'))
      .catch(err => alert(err.message))
  }

  return (
    <div>
      {error && <h4>{error}</h4>}
      {alliance && alliance.id && (
        <>
          <h3>Datos</h3>
          <table>
            <tbody>
              <tr>
                <td>Nombre:</td>
                <td>{alliance.long_name}</td>
              </tr>
              <tr>
                <td>Iniciales:</td>
                <td>{alliance.short_name}</td>
              </tr>
              <tr>
                <td>Descripción:</td>
                <td>{alliance.description}</td>
              </tr>
            </tbody>
          </table>
          <h3>Miembros</h3>
          <table>
            <thead>
              <tr>
                <th>Posición en ranking</th>
                <th>Nombre</th>
                <th>Rango</th>
                <th>Ingresos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alliance.members.map(member => {
                return (
                  <tr key={member.user.id}>
                    <td>{member.user.rank_position.toLocaleString()}</td>
                    <td>
                      <Username user={member.user} />
                    </td>
                    <td>
                      {member.rank_name}
                      {member.is_admin ? ' (Líder)' : ''}
                    </td>
                    <td>{member.user.income.toLocaleString()}</td>
                    <td>
                      <p>
                        <UserActionLinks user={member.user} />
                      </p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!userData.has_alliance && <button onClick={createMemberRequest}>Pedir ser miembro</button>}
        </>
      )}
    </div>
  )
}
