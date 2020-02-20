import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import Container from 'components/UI/container'

NewMessageModal.propTypes = {
  user: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function NewMessageModal({ user, isOpen, onRequestClose }) {
  const [message, setMessage] = useState('')
  const [addressee, setAddressee] = useState((user && user.username) || '')

  function sendClicked(e) {
    e.preventDefault()
    api
      .post('/v1/messages/new', { message, addressee })
      .then(() => {
        onRequestClose()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <Container whiteBorder darkBg borderSize={20}>
        <form>
          <div>
            <label>
              Para: <input type="text" value={addressee} onChange={e => setAddressee(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              Mensaje: <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength="500"></textarea>
            </label>
          </div>
          <button onClick={sendClicked}>Enviar</button>
        </form>
      </Container>
    </Modal>
  )
}
