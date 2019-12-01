import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import CreateAlliance from './CreateAlliance'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

let lastAllianceData = null
export default function Alliance() {
  const [alliance, setAlliance] = useState(lastAllianceData)
  const [error, setError] = useState(false)

  useEffect(() => {
    lastAllianceData = alliance
  }, [alliance])

  const reloadAllianceData = useCallback(() => {
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
      {alliance && <AllianceRouter alliance={alliance} />}
    </div>
  )
}

AllianceRouter.propTypes = {
  alliance: PropTypes.object.isRequired,
}
function AllianceRouter({ alliance }) {
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
          <AllianceResources alliance={alliance} />
        </Route>
        <Route path="/alliance/research">
          <AllianceResearch alliance={alliance} />
        </Route>
        <Route path="/alliance/admin">
          <AllianceAdmin alliance={alliance} />
        </Route>
        <Route path="/alliance">
          <AllianceHome alliance={alliance} />
        </Route>
      </Switch>
    </div>
  )
}

AllianceResources.propTypes = {
  alliance: PropTypes.object.isRequired,
}
function AllianceResources({ alliance }) {
  return (
    <div>
      <h2>Resources</h2>
      <pre>{JSON.stringify(alliance.resources, null, 2)}</pre>
    </div>
  )
}

AllianceResearch.propTypes = {
  alliance: PropTypes.object.isRequired,
}
function AllianceResearch({ alliance }) {
  return (
    <div>
      <h2>Research</h2>
      <pre>{JSON.stringify(alliance.researchs, null, 2)}</pre>
    </div>
  )
}

AllianceAdmin.propTypes = {
  alliance: PropTypes.object.isRequired,
}
function AllianceAdmin({ alliance }) {
  return (
    <div>
      <h2>Admin</h2>
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
          <th>Ingresos</th>
        </tr>
        {alliance.members.map(member => {
          return (
            <tr key={member.user.id}>
              <td>{member.user.rank_position}</td>
              <td>{member.user.username}</td>
              <td>
                {member.rank_name}
                {member.is_admin ? ' (P)' : ''}
              </td>
              <td>{member.user.income}€/día</td>
            </tr>
          )
        })}
      </table>
    </div>
  )
}
