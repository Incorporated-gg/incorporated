import React from 'react'
import api from 'lib/api'
import PropTypes from 'prop-types'
import { userData } from 'lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { getServerDay } from 'lib/serverTime'
import styles from './single-message.module.scss'
import ErrorBoundary from 'components/UI/ErrorBoundary'
import AllianceLink from 'components/alliance/alliance-link'
import IncContainer from 'components/UI/inc-container'
import UserLink from 'components/UI/user-link'
import Icon from 'components/icon'
import IncButton from 'components/UI/inc-button'
import { getContestRewards } from 'shared-lib/commonUtils'
import { contestIDToName } from 'lib/utils'

SingleMessage.propTypes = {
  message: PropTypes.object.isRequired,
  reloadMessagesData: PropTypes.func.isRequired,
}
export default function SingleMessage({ reloadMessagesData, message }) {
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
    <IncContainer darkBg outerClassName={styles.outerContainer}>
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
        {wasSentToMe && <IncButton onClick={deleteMessage}>Borrar</IncButton>}
      </div>
    </IncContainer>
  )
}

function getMessage(message) {
  let messageElm = null
  switch (message.type) {
    case 'private_message': {
      messageElm = (
        <div>
          <div>{message.data.message}</div>
        </div>
      )
      break
    }
    case 'monopoly_reward': {
      const reward = getContestRewards('monopolies', 0)
      messageElm = (
        <div>
          <p>
            Enhorabuena por ganar el monopolio semanal! Ganaste el monopolio de{' '}
            {buildingsList.find(b => b.id === message.data.building_id).name} con {message.data.building_quantity}{' '}
            edificios.
          </p>
          <div>
            +{reward.gold} <Icon iconName="gold" size={20} />
          </div>
          <p>+{reward.xp} XP</p>
        </div>
      )
      break
    }
    case 'contest_win':
      {
        const reward = getContestRewards(message.data.contest_id, message.data.rank)
        messageElm = (
          <div>
            <p>
              Enhorabuena por ganar el concurso de {contestIDToName(message.data.contest_id)}! Quedaste en posición{' '}
              {message.data.rank}.
            </p>
            <p>
              +{reward.gold} <Icon iconName="gold" size={20} />
            </p>
            <p>+{reward.xp} XP</p>
          </div>
        )
      }
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
    default: {
      messageElm = (
        <div>
          <b>Tipo &quot;{message.type}&quot; desconocido</b>: {JSON.stringify(message)}
        </div>
      )
    }
  }
  return messageElm
}
