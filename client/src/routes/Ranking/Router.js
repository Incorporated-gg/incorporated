import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Ranking from './Ranking'
import UserProfile from './UserProfile'
import AllianceProfile from './AllianceProfile'

export default function MessagesRouter() {
  return (
    <>
      <Switch>
        <Route path="/ranking/user/:username">
          <UserProfile />
        </Route>
        <Route path="/ranking/alliance/:allianceID">
          <AllianceProfile />
        </Route>
        <Route path="/ranking">
          <Ranking />
        </Route>
      </Switch>
    </>
  )
}
