import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import { Switch, Route, Link } from 'react-router-dom'
import Username from '../../components/Username'
import CreateAlliance from './CreateAlliance'
import AllianceResearch from './Research'
import AllianceResources from './Resources'

let lastAllianceData = null
export default function Alliance() {
  const [alliance, setAlliance] = useState(lastAllianceData)
  const [error, setError] = useState(false)

  useEffect(() => {
    lastAllianceData = alliance
  }, [alliance])

  const reloadAllianceData = useCallback(() => {
    setAlliance(null)
    api
      .get('/v1/alliance')
      .then(res => {
        setAlliance(res.alliance)
      })
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    reloadAllianceData()
  }, [reloadAllianceData])

  return (
    <div>
      <h2>Alliance</h2>
      {error && <h4>{error}</h4>}
      {alliance === null && <span>Cargando</span>}
      {alliance === false && <CreateAlliance reloadAllianceData={reloadAllianceData} />}
      {alliance && <AllianceRouter reloadAllianceData={reloadAllianceData} alliance={alliance} />}
    </div>
  )
}

AllianceRouter.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
function AllianceRouter({ alliance, reloadAllianceData }) {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/alliance">Home</Link>
          </li>
          <li>
            <Link to="/alliance/resources">Recursos</Link>
          </li>
          <li>
            <Link to="/alliance/research">Investigaciones</Link>
          </li>
          <li>
            <Link to="/alliance/admin">Admin</Link>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route path="/alliance/resources">
          <AllianceResources alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance/research">
          <AllianceResearch alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance/admin">
          <AllianceAdmin alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance">
          <AllianceHome alliance={alliance} />
        </Route>
      </Switch>
    </div>
  )
}

AllianceAdmin.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
function AllianceAdmin({ alliance, reloadAllianceData }) {
  const deleteAlliance = () => {
    api
      .post('/v1/delete_alliance')
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }
  return (
    <div>
      <h2>Admin</h2>
      <button onClick={deleteAlliance}>Borrar alianza</button>
      <pre>{JSON.stringify(alliance, null, 2)}</pre>
    </div>
  )
}

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
}
function AllianceHome({ alliance }) {
  return (
    <div>
      <h5>Datos</h5>
      <table>
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
      </table>
      <h5>Miembros</h5>
      <table>
        <tr>
          <th>Posición en ranking</th>
          <th>Nombre de usuario</th>
          <th>Rango</th>
          <th>Ingresos por día</th>
        </tr>
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
              <td>{member.user.income}€</td>
            </tr>
          )
        })}
      </table>
    </div>
  )
}
