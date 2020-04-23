import React, { useState } from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import IncInput from 'components/UI/inc-input'

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
      <IncContainer withHairline darkBg borderSize={20}>
        <form>
          <div>
            <label>
              Para: <input type="text" value={addressee} onChange={e => setAddressee(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              Mensaje: <IncInput showBorder multiline value={message} onChangeText={setMessage} maxLength="500" />
            </label>
          </div>
          <button onClick={sendClicked}>Enviar</button>
        </form>
      </IncContainer>
    </Modal>
  )
}
