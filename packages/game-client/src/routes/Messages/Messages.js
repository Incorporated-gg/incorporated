import React, { useState } from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'
import MessagesList from 'components/messages/components/messages-list'
import NewMessageModal from 'components/messages/components/new-message-modal'
import IncContainer from 'components/UI/inc-container'
import styles from './messages.module.scss'

export default function Messages() {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)

  return (
    <>
      <IncContainer darkBg>
        <div style={{ display: 'flex' }}>
          <NavLink className={styles.subMenuItem} to="/messages" exact>
            Recibidos
          </NavLink>
          <NavLink className={styles.subMenuItem} to="/messages/sent" exact>
            Enviados
          </NavLink>
          <a
            className={styles.subMenuItem}
            href=" "
            onClick={e => {
              e.preventDefault()
              setShowNewMessageModal(true)
            }}>
            Escribir
          </a>
        </div>
      </IncContainer>

      <NewMessageModal isOpen={showNewMessageModal} onRequestClose={() => setShowNewMessageModal(false)} />

      <Switch>
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
