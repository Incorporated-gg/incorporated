import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import MessagesList from './MessagesList'
import NewMessage from './NewMessage'

export default function Messages() {
  return (
    <>
      <nav className="sub-menu">
        <ul>
          <li>
            <NavLink to="/messages" exact>
              Recibidos
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages/sent">Enviados</NavLink>
          </li>
          <li>
            <NavLink to="/messages/new">Escribir</NavLink>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route path="/messages/new/:username?">
          <NewMessage />
        </Route>
        <Route path="/messages/sent">
          <MessagesList type="sent" />
        </Route>
        <Route path="/messages">
          <MessagesList type="received" />
        </Route>
      </Switch>
    </>
  )
}
