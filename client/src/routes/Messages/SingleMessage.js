import React from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import PropTypes from 'prop-types'
import { userData } from '../../lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { Link } from 'react-router-dom'
import { personnelList } from 'shared-lib/personnelUtils'
import { researchList } from 'shared-lib/researchUtils'
import styles from './Messages.module.scss'
import UserActionLinks from '../../components/UserActionLinks'
import ErrorBoundary from '../../components/ErrorBoundary'
import AllianceLink from '../../components/AllianceLink'

SingleMessage.propTypes = {
  message: PropTypes.object.isRequired,
  reloadMessagesData: PropTypes.func.isRequired,
}
export default function SingleMessage({ reloadMessagesData, message }) {
  const deleteMessage = e => {
    e.preventDefault()
    api
      .post(`/v1/messages/delete`, { message_id: message.id })
      .then(() => reloadMessagesData())
      .catch(err => {
        alert(err.message)
      })
  }
  const wasSentToMe = message.receiver && message.receiver.id === userData.id
  const dateFormatted = new Date(message.created_at * 1000).toLocaleString()

  let messageElm
  try {
    messageElm = parseMessage(message)
  } catch (err) {
    console.error(err)
    messageElm = (
      <div>
        <b>Error al intepretar mensaje</b>: {err.message}
      </div>
    )
  }

  return (
    <div className={styles.messageContainer}>
      {wasSentToMe && message.sender && (
        <div>
          {'Enviado por: '}
          <Username user={message.sender} />
        </div>
      )}
      {!wasSentToMe && message.receiver && (
        <div>
          {'Enviado a: '}
          <Username user={message.receiver} />
        </div>
      )}
      <div>Fecha: {dateFormatted}</div>
      <br />
      <ErrorBoundary>
        <div className={styles.messageText}>{messageElm}</div>
      </ErrorBoundary>
      <br />
      {wasSentToMe && message.sender && (
        <button>
          <Link to={`/messages/new/${message.sender.username}`}>Responder</Link>
        </button>
      )}
      {wasSentToMe && <button onClick={deleteMessage}>Borrar</button>}
    </div>
  )
}

function parseMessage(message) {
  let messageElm = null
  switch (message.type) {
    case 'private_message':
      messageElm = (
        <div>
          <div>{message.data.message}</div>
          <UserActionLinks user={message.sender} />
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
    case 'attack_report': {
      const mission = message.data.mission
      const wasIAttacked = mission.target_user && mission.target_user.id === userData.id
      messageElm = (
        <>
          <AttackReportMsg mission={mission} showSender={wasIAttacked} showTarget={!wasIAttacked} />
          <UserActionLinks user={wasIAttacked ? mission.user : mission.target_user} />
        </>
      )
      break
    }
    case 'caught_spies':
      messageElm = (
        <div>
          Hemos cazado a {message.data.captured_spies.toLocaleString()} espías de{' '}
          <Username user={message.data.attacker} /> que nos intentaban robar información confidencial!
          <UserActionLinks user={message.data.attacker} />
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
    case 'spy_report': {
      const mission = message.data.mission
      messageElm = (
        <div>
          <div>
            Resultado de espionaje a: <Username user={mission.target_user} />
          </div>
          <SpyReportMsg mission={mission} />
          <UserActionLinks user={mission.target_user} />
        </div>
      )
      break
    }
    case 'attack_cancelled': {
      messageElm = (
        <div>
          <div>
            El ataque a <Username user={message.data.target_user} /> no se ha podido completar, ya que el usuario ya ha
            recibido el máximo de ataques posibles por hoy. ¡Mañana tendremos otra oportunidad de darle caza!
          </div>
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

AttackReportMsg.propTypes = {
  mission: PropTypes.object.isRequired,
  showSender: PropTypes.bool,
  showTarget: PropTypes.bool,
}
export function AttackReportMsg({ mission, showSender, showTarget }) {
  const buildingInfo = buildingsList.find(b => b.id === mission.target_building)
  const displayResult =
    mission.result === 'win'
      ? 'Éxito'
      : mission.result === 'lose'
      ? 'Fracaso'
      : mission.result === 'draw'
      ? 'Empate'
      : mission.result
  return (
    <div>
      {showSender && (
        <div>
          Ataque enviado por <Username user={mission.user} />
        </div>
      )}
      {showTarget && (
        <div>
          Ataque a <Username user={mission.target_user} />
        </div>
      )}
      <div>Resultado: {displayResult}</div>
      <div>Ladrones enviados: {mission.sent_thieves.toLocaleString()}</div>
      <div>Saboteadores enviados: {mission.sent_sabots.toLocaleString()}</div>
      <div>Edificio atacado: {buildingInfo.name}</div>
      <div>Guardias muertos: {mission.report.killed_guards.toLocaleString()}</div>
      <div>Saboteadores muertos: {mission.report.killed_sabots.toLocaleString()}</div>
      <div>Ladrones muertos: {mission.report.killed_thieves.toLocaleString()}</div>
      <div>Edificios destruidos: {mission.report.destroyed_buildings}</div>
      <div>Dinero ganado por edificios: {mission.report.income_from_buildings.toLocaleString()}€</div>
      <div>Dinero ganado por muertes: {mission.report.income_from_troops.toLocaleString()}€</div>
      <div>Dinero ganado por robo: {mission.report.income_from_robbed_money.toLocaleString()}€</div>
      <div>Beneficios netos: {mission.profit.toLocaleString()}€</div>
    </div>
  )
}

SpyReportMsg.propTypes = {
  mission: PropTypes.object.isRequired,
}
export function SpyReportMsg({ mission }) {
  return (
    <div>
      <div>Número de espías enviados: {mission.sent_spies}</div>
      {mission.report.captured_spies > 0 && (
        <div>
          Durante la misión el enemigo fue alertado, y capturaron a {mission.report.captured_spies.toLocaleString()} de
          nuestros espías. Quizás deberíamos haber mandado menos espías, o invertido más en la investigación de
          espionaje.
        </div>
      )}
      {mission.report.buildings && (
        <div>
          <b>{'Edificios'}:</b>
          <br />
          {buildingsList.map(buildingInfo => {
            const building = mission.report.buildings[buildingInfo.id]
            return (
              <React.Fragment key={buildingInfo.id}>
                {buildingInfo.name}. Cantidad: {building.quantity.toLocaleString()}. Dinero:
                {building.money.toLocaleString()}€.
                <br />
              </React.Fragment>
            )
          })}
        </div>
      )}
      {mission.report.personnel && (
        <div>
          <b>{'Personal'}:</b>
          <br />
          {personnelList.map(personnelInfo => {
            return (
              <React.Fragment key={personnelInfo.resource_id}>
                {personnelInfo.name}: {mission.report.personnel[personnelInfo.resource_id]}
                <br />
              </React.Fragment>
            )
          })}
        </div>
      )}
      {mission.report.researchs && (
        <div>
          <b>{'Investigaciones'}:</b>
          <br />
          {researchList.map(researchInfo => {
            return (
              <React.Fragment key={researchInfo.id}>
                {researchInfo.name}: {mission.report.researchs[researchInfo.id]}
                <br />
              </React.Fragment>
            )
          })}
        </div>
      )}
      {!mission.report.buildings &&
        (mission.report.captured_spies === 0 ? (
          <div>No hemos obtenido ninguna información! Tendremos que enviar más espías</div>
        ) : (
          <div>No hemos obtenido ninguna información! Nos han capturado a demasiados espías</div>
        ))}
    </div>
  )
}
