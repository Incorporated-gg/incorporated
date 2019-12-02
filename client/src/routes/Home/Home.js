import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import FinancialData from './FinancialData'
import Monopolies from '../Monopolies/Monopolies'

export default function Home() {
  return (
    <>
      <nav className="sub-menu">
        <ul>
          <li>
            <NavLink to="/" exact>
              Financias
            </NavLink>
          </li>
          <li>
            <NavLink to="/monopolies">Monopolios</NavLink>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route path="/monopolies">
          <Monopolies />
        </Route>
        <Route path="/">
          <FinancialData />
        </Route>
      </Switch>
    </>
  )
}
