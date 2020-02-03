import React, { useState } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import MessagesList from './MessagesList'
import Missions from './Missions'
import NewMessageModal from './NewMessageModal'

export default function Messages() {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)

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
            <NavLink to="/messages/missions">Misiones</NavLink>
          </li>
          <li>
            <NavLink to="/messages/sent">Enviados</NavLink>
          </li>
          <li>
            <a
              href=" "
              onClick={e => {
                e.preventDefault()
                setShowNewMessageModal(true)
              }}>
              Escribir
            </a>
          </li>
        </ul>
      </nav>

      <NewMessageModal isOpen={showNewMessageModal} onRequestClose={() => setShowNewMessageModal(false)} />

      <Switch>
        <Route path="/messages/sent">
          <MessagesList type="sent" />
        </Route>
        <Route path="/messages/missions">
          <Missions />
        </Route>
        <Route path="/messages">
          <MessagesList type="received" />
        </Route>
      </Switch>
    </>
  )
}