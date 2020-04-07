import React, { useState } from 'react'
import api from 'lib/api'
import PropTypes from 'prop-types'
import { userData } from 'lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { getServerDay } from 'shared-lib/serverTime'
import styles from './single-message.module.scss'
import ErrorBoundary from 'components/UI/ErrorBoundary'
import AllianceLink from 'components/alliance/alliance-link'
import NewMessageModal from './new-message-modal'
import Container from 'components/UI/container'
import UserLink from 'components/UI/UserLink'

SingleMessage.propTypes = {
  message: PropTypes.object.isRequired,
  reloadMessagesData: PropTypes.func.isRequired,
}
export default function SingleMessage({ reloadMessagesData, message }) {
  const [showMessageModal, setShowMessageModal] = useState(false)

  const deleteMessage = e => {
    e.preventDefault()
    if (!window.confirm('Estás seguro/a de que quieres borrar el mensaje?')) return

    api
      .post(`/v1/messages/delete`, { message_id: message.id })
      .then(() => reloadMessagesData())
      .catch(err => {
        alert(err.message)
      })
  }
  const wasSentToMe = message.receiver && message.receiver.id === userData.id
  const dateFormatted = new Date(message.created_at * 1000).toLocaleString()
  const serverDay = getServerDay(message.created_at * 1000)

  let messageElm
  try {
    messageElm = getMessage(message)
  } catch (err) {
    console.error(err)
    messageElm = (
      <div>
        <b>Error al intepretar mensaje</b>: {err.message}
      </div>
    )
  }

  return (
    <Container darkBg outerClassName={styles.outerContainer}>
      <div className={styles.messageContainer}>
        <div className={styles.msgInfo}>
          <div>
            {wasSentToMe && message.sender && (
              <>
                {'Enviado por: '}
                <UserLink user={message.sender} />
              </>
            )}
            {!wasSentToMe && message.receiver && (
              <>
                {'Enviado a: '}
                <UserLink user={message.receiver} />
              </>
            )}
          </div>
          <div>
            Día {serverDay}. {dateFormatted}
          </div>
        </div>
        <br />
        <ErrorBoundary>
          <div className={styles.messageText}>{messageElm}</div>
        </ErrorBoundary>
        <br />
        {wasSentToMe && message.sender && (
          <>
            <button onClick={() => setShowMessageModal(true)}>Responder</button>
            <NewMessageModal
              user={message.sender}
              isOpen={showMessageModal}
              onRequestClose={() => setShowMessageModal(false)}
            />
          </>
        )}
        {wasSentToMe && <button onClick={deleteMessage}>Borrar</button>}
      </div>
    </Container>
  )
}

function getMessage(message) {
  let messageElm = null
  switch (message.type) {
    case 'private_message':
      messageElm = (
        <div>
          <div>{message.data.message}</div>
        </div>
      )
      break
    case 'monopoly_reward':
      messageElm = (
        <div>
          Enhorabuena por ganar el monopolio semanal! Ganaste el monopolio de{' '}
          {buildingsList.find(b => b.id === message.data.building_id).name} con {message.data.building_quantity}{' '}
          edificios
        </div>
      )
      break
    case 'war_started': {
      const didWeDeclare =
        userData.alliance &&
        message.data.attacker_alliance &&
        userData.alliance.id === message.data.attacker_alliance.id
      messageElm = didWeDeclare ? (
        <div>
          Hemos declarado la guerra a la alianza <AllianceLink alliance={message.data.defender_alliance} />. Comenzará a
          las 00:00 hora server
        </div>
      ) : (
        <div>
          Nos ha declarado la guerra la alianza <AllianceLink alliance={message.data.attacker_alliance} />. Comenzará a
          las 00:00 hora server
        </div>
      )
      break
    }
    case 'war_ended': {
      const didWeDeclare =
        userData.alliance &&
        message.data.attacker_alliance &&
        userData.alliance.id === message.data.attacker_alliance.id
      messageElm = (
        <div>
          Ha terminado la guerra con la alianza{' '}
          <AllianceLink alliance={didWeDeclare ? message.data.defender_alliance : message.data.attacker_alliance} />. Ha
          ganado la alianza{' '}
          <AllianceLink
            alliance={message.data.winner === 1 ? message.data.attacker_alliance : message.data.defender_alliance}
          />
          .
        </div>
      )
      break
    }
    case 'loan_started':
      messageElm = (
        <div>
          <UserLink user={message.data.borrower} /> ha pedido un préstamo a <UserLink user={message.data.lender} /> de{' '}
          <i>{message.data.money_amount.toLocaleString()}€</i> con un{' '}
          <i>{message.data.interest_rate.toLocaleString()}%</i> de interés
        </div>
      )
      break
    case 'loan_ended':
      messageElm = (
        <div>
          Ha finalizado el préstamo que <UserLink user={message.data.borrower} /> pidió a{' '}
          <UserLink user={message.data.lender} /> de <i>{message.data.money_amount.toLocaleString()}€</i> con un{' '}
          <i>{message.data.interest_rate.toLocaleString()}%</i> de interés
        </div>
      )
      break
    case 'attack_cancelled': {
      messageElm = (
        <div>
          El ataque a <UserLink user={message.data.target_user} /> no se ha podido completar, ya que el usuario ya ha
          recibido el máximo de ataques posibles por hoy. ¡Mañana tendremos otra oportunidad de darle caza!
        </div>
      )
      break
    }
    case 'new_alli_member_req': {
      messageElm = (
        <div>
          Hemos recibido una nueva petición de miembro de <UserLink user={message.data.sender_user} />
        </div>
      )
      break
    }
    default:
      messageElm = (
        <div>
          <b>Tipo &quot;{message.type}&quot; desconocido</b>: {JSON.stringify(message)}
        </div>
      )
  }
  return messageElm
}
