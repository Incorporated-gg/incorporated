import React from 'react'
import PropTypes from 'prop-types'
import Username from '../../components/Username'
import api from '../../lib/api'
import { Link } from 'react-router-dom'

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceHome({ alliance, reloadAllianceData }) {
  const leaveAlliance = () => {
    if (!window.confirm('Estás seguro de que quieres salir?')) return
    api
      .post('/v1/alliance/leave')
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <div>
      <h5>Datos</h5>
      <table>
        <tbody>
          <tr>
            <th>Nombre</th>
            <td>{alliance.long_name}</td>
          </tr>
          <tr>
            <th>Iniciales</th>
            <td>{alliance.short_name}</td>
          </tr>
          <tr>
            <th>Descripción</th>
            <td>{alliance.description}</td>
          </tr>
        </tbody>
      </table>
      <h5>Miembros</h5>
      <table>
        <thead>
          <tr>
            <th>Posición en ranking</th>
            <th>Nombre de usuario</th>
            <th>Rango</th>
            <th>Ingresos por día</th>
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
                <td>{member.user.income.toLocaleString()}€</td>
                <td>
                  <p>
                    <Link to={`/messages/new/${member.user.username}`}>Enviar mensaje</Link>
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button onClick={leaveAlliance}>Salir</button>
    </div>
  )
}
