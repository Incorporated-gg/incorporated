import React from 'react'
import PropTypes from 'prop-types'
import Username from '../../components/Username'

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
}
export default function AllianceHome({ alliance }) {
  return (
    <div>
      <h5>Datos</h5>
      <table>
        <tbody>
          <tr>
            <th>ID</th>
            <td>{alliance.id}</td>
          </tr>
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
          </tr>
        </thead>
        <tbody>
          {alliance.members.map(member => {
            return (
              <tr key={member.user.id}>
                <td>{member.user.rank_position}</td>
                <td>
                  <Username user={member.user} />
                </td>
                <td>
                  {member.rank_name}
                  {member.is_admin ? ' (P)' : ''}
                </td>
                <td>{member.user.income.toLocaleString()}€</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
