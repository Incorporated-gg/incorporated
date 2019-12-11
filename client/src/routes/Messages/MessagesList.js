import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import SingleMessage from './SingleMessage'

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
