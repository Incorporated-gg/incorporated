import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import { Switch, Route, Link } from 'react-router-dom'
import CreateAlliance from './CreateAlliance'
import AllianceResearch from './Research'
import AllianceResources from './Resources'
import AllianceHome from './Home'
import AllianceAdmin from './Admin'
import { userData } from '../../lib/user'

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
      <h2>Alianza</h2>
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
  const myMemberData = alliance.members.find(member => member.user.id === userData.id)

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
          {myMemberData.is_admin && (
            <li>
              <Link to="/alliance/admin">Admin</Link>
            </li>
          )}
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
