import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import PropTypes from 'prop-types'
import { userData } from '../../lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'

MessagesList.propTypes = {
  type: PropTypes.string.isRequired,
}
export default function MessagesList({ type }) {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(false)

  const reloadMessagesData = useCallback(() => {
    setMessages([])
    api
      .get('/v1/messages', { type })
      .then(res => {
        setMessages(res.messages)
      })
      .catch(err => setError(err.message))
  }, [type])

  useEffect(() => {
    reloadMessagesData()
  }, [reloadMessagesData])
  return (
    <>
      {error && <h4>{error}</h4>}
      {messages.length === 0 && <h4>No hay mensajes</h4>}
      {messages.map(message => (
        <SingleMessage key={message.id} message={message} reloadMessagesData={reloadMessagesData} />
      ))}
    </>
  )
}

SingleMessage.propTypes = {
  message: PropTypes.object.isRequired,
  reloadMessagesData: PropTypes.func.isRequired,
}
function SingleMessage({ reloadMessagesData, message }) {
  const deleteMessage = e => {
    e.preventDefault()
    api
      .post(`/v1/messages/delete`, { message_id: message.id })
      .then(() => reloadMessagesData())
      .catch(err => {
        alert(err.message)
      })
  }
  const isMine = message.receiver && message.receiver.id === userData.id
  const dateFormatted = new Date(message.created_at * 1000).toLocaleString()
  return (
    <div>
      {isMine && message.sender && (
        <div>
          {'Enviado por: '}
          <Username user={message.sender} />
        </div>
      )}
      {!isMine && message.receiver && (
        <div>
          {'Enviado a: '}
          <Username user={message.receiver} />
        </div>
      )}
      <div>Fecha: {dateFormatted}</div>
      {message.type === 'private_message' ? (
        <div>{message.data.message}</div>
      ) : message.type === 'monopoly_reward' ? (
        <div>
          Enhorabuena por ganar el monopolio semanal! Ganaste el monopolio de{' '}
          {buildingsList.find(b => b.id === message.data.building_id).name} con {message.data.building_quantity}{' '}
          edificios
        </div>
      ) : (
        <div>Tipo desconocido</div>
      )}
      {isMine && <button onClick={deleteMessage}>Borrar</button>}
      <hr />
    </div>
  )
}
