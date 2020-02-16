import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import AllianceResearch from 'routes/alliance/alliance-research'
import AllianceResources from 'routes/alliance/alliance-resources'
import AllianceMissions from 'routes/alliance/alliance-missions'
import AllianceHome from 'routes/alliance/alliance-home'
import AllianceWars from 'routes/alliance/alliance-wars'
import AllianceAdmin from 'routes/alliance/alliance-admin'

AllianceRouter.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceRouter({ alliance, reloadAllianceData }) {
  return (
    <>
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
