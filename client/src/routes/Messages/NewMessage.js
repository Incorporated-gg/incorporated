import React, { useState } from 'react'
import api from '../../lib/api'
import { useParams } from 'react-router-dom'

export default function NewMessage() {
  const { username: routeUsername } = useParams()
  const [message, setMessage] = useState('')
  const [toUsername, setToUsername] = useState(routeUsername)

  function sendClicked(e) {
    e.preventDefault()
    api
      .post('/v1/messages/new', { message, to_username: toUsername })
      .then(() => {
        setMessage('')
        setToUsername('')
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <form className="login-form">
      <div>
        <label>
          Para: <input type="text" value={toUsername} onChange={e => setToUsername(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Mensaje: <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength="500"></textarea>
        </label>
      </div>
      <button onClick={sendClicked}>Enviar</button>
    </form>
  )
}
