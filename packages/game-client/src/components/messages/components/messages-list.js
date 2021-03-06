import React, { useState, useEffect, useCallback } from 'react'
import api from '../../../lib/api'
import SingleMessage from './single-message'

MessagesList.propTypes = {}
export default function MessagesList() {
  const [messages, setMessages] = useState()
  const [error, setError] = useState(false)

  const reloadMessagesData = useCallback(() => {
    setMessages()
    api
      .get('/v1/messages')
      .then(res => {
        setMessages(res.messages)
      })
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    reloadMessagesData()
  }, [reloadMessagesData])

  if (error) return <h4>{error}</h4>
  if (!messages) return <div>Cargando</div>
  if (messages.length === 0) return <div>No hay mensajes</div>

  return messages.map(message => (
    <SingleMessage key={message.id} message={message} reloadMessagesData={reloadMessagesData} />
  ))
}
