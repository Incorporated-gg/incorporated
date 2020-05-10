import React, { useState } from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import IncInput from 'components/UI/inc-input/inc-input'
import IncButton from 'components/UI/inc-button'

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
      <IncContainer withHairline darkBg>
        <form style={{ padding: 10 }}>
          <div>
            <label>
              Para: <IncInput showBorder type="text" value={addressee} onChangeText={setAddressee} />
            </label>
          </div>
          <br />
          <div>
            <label>
              Mensaje: <IncInput showBorder multiline value={message} onChangeText={setMessage} maxLength="500" />
            </label>
          </div>
          <br />
          <IncButton onClick={sendClicked}>Enviar</IncButton>
        </form>
      </IncContainer>
    </Modal>
  )
}
