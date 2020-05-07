import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Ranking from './Ranking'
import UserProfile from './UserProfile/UserProfile'
import AllianceProfile from './AllianceProfile/AllianceProfile'

export default function RankingRouter() {
  return (
    <Switch>
      <Route path="/ranking/user/:username">
        <UserProfile />
      </Route>
      <Route path="/ranking/alliance/:allianceShortName">
        <AllianceProfile />
      </Route>
      <Route path="/ranking/alliances">
        <Ranking />
      </Route>
      <Route path="/ranking/research">
        <Ranking />
      </Route>
      <Route path="/ranking">
        <Ranking />
      </Route>
    </Switch>
  )
}
