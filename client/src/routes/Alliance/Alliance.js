import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import { Switch, Route, NavLink } from 'react-router-dom'
import CreateAlliance from './CreateAlliance'
import AllianceResearch from './Research'
import AllianceResources from './Resources'
import AllianceMissions from './Missions'
import AllianceHome from './Home'
import AllianceWars from './Wars'
import AllianceAdmin from './Admin/index.js'
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
    <>
      {error && <h4>{error}</h4>}
      {alliance === null && <span>Cargando</span>}
      {alliance === false && <CreateAlliance reloadAllianceData={reloadAllianceData} />}
      {alliance && <AllianceRouter reloadAllianceData={reloadAllianceData} alliance={alliance} />}
    </>
  )
}

AllianceRouter.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
function AllianceRouter({ alliance, reloadAllianceData }) {
  const myMemberData = alliance.members.find(member => member.user.id === userData.id)

  return (
    <>
      <nav className="sub-menu">
        <ul>
          <li>
            <NavLink to="/alliance" exact>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/alliance/resources">Recursos</NavLink>
          </li>
          <li>
            <NavLink to="/alliance/missions">Misiones</NavLink>
          </li>
          <li>
            <NavLink to="/alliance/research">Investigaciones</NavLink>
          </li>
          <li>
            <NavLink to="/alliance/wars">Guerras</NavLink>
          </li>
          {myMemberData && myMemberData.is_admin && (
            <li>
              <NavLink to="/alliance/admin">Admin</NavLink>
            </li>
          )}
        </ul>
      </nav>

      <Switch>
        <Route path="/alliance/resources">
          <AllianceResources alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance/missions/:missionType?">
          <AllianceMissions alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance/research">
          <AllianceResearch alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance/admin">
          <AllianceAdmin alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance/wars">
          <AllianceWars alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
        <Route path="/alliance">
          <AllianceHome alliance={alliance} reloadAllianceData={reloadAllianceData} />
        </Route>
      </Switch>
    </>
  )
}
