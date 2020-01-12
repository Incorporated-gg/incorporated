import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import SingleMessage from './SingleMessage'

MessagesList.propTypes = {
  type: PropTypes.string.isRequired,
}
export default function MessagesList({ type }) {
  const [messages, setMessages] = useState()
  const [error, setError] = useState(false)

  const reloadMessagesData = useCallback(() => {
    setMessages()
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

  if (error) return <h4>{error}</h4>
  if (!messages) return <div>Cargando</div>
  if (messages.length === 0) return <div>No hay mensajes</div>

  return messages.map(message => (
    <SingleMessage key={message.id} message={message} reloadMessagesData={reloadMessagesData} />
  ))
}
