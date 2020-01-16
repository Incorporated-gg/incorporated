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
      messageElm = <AttackReportMsg message={message} />
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
    case 'spy_report':
      messageElm = (
        <div>
          <div>
            Resultado de espionaje a: <Username user={message.data.defender} />
          </div>
          {message.data.captured_spies > 0 && (
            <div>
              Durante la misión el enemigo fue alertado, y capturaron a {message.data.captured_spies.toLocaleString()}{' '}
              de nuestros espías. Quizás deberíamos haber mandado menos espías, o invertido más en la investigación de
              espionaje.
            </div>
          )}
          {message.data.intel_report && Object.keys(message.data.intel_report).length > 0 ? (
            <>
              <div>Número de espías: {message.data.spies_count}</div>
              {message.data.intel_report.buildings && (
                <div>
                  <b>{'Edificios: '}</b>
                  {buildingsList
                    .map(buildingInfo => {
                      const building = message.data.intel_report.buildings[buildingInfo.id]
                      return `${
                        buildingInfo.name
                      }. Cantidad: ${building.quantity.toLocaleString()}. Dinero: ${building.money.toLocaleString()}.`
                    })
                    .join('\n')}
                </div>
              )}
              {message.data.intel_report.personnel && (
                <div>
                  <b>{'Personal: '}</b>
                  {personnelList
                    .map(personnelInfo => {
                      return personnelInfo.name + ': ' + message.data.intel_report.personnel[personnelInfo.resource_id]
                    })
                    .join(', ')}
                </div>
              )}
              {message.data.intel_report.researchs && (
                <div>
                  <b>{'Investigaciones: '}</b>
                  {researchList
                    .map(researchInfo => {
                      return researchInfo.name + ': ' + message.data.intel_report.researchs[researchInfo.id]
                    })
                    .join(', ')}
                </div>
              )}
            </>
          ) : message.data.captured_spies === 0 ? (
            <div>No hemos obtenido ninguna información! Tendremos que enviar más espías</div>
          ) : (
            <div>No hemos obtenido ninguna información! Nos han capturado a demasiados espías</div>
          )}
          <UserActionLinks user={message.data.defender} />
        </div>
      )
      break
    default:
      messageElm = (
        <div>
          <b>Tipo desconocido</b>: {JSON.stringify(message)}
        </div>
      )
  }
  return messageElm
}

AttackReportMsg.propTypes = {
  message: PropTypes.object.isRequired,
}
function AttackReportMsg({ message }) {
  const mission = message.data.mission
  const wasIAttacked = mission.target_user && mission.target_user.id === userData.id
  const buildingInfo = buildingsList.find(b => b.id === mission.target_building)
  return (
    <div>
      {wasIAttacked ? (
        <div>
          Ataque recibido de <Username user={mission.user} />
        </div>
      ) : (
        <div>
          Ataque a <Username user={mission.target_user} />
        </div>
      )}
      <div>Resultado: {mission.result}</div>
      <div>Ladrones enviados: {mission.sent_thiefs.toLocaleString()}</div>
      <div>Saboteadores enviados: {mission.sent_sabots.toLocaleString()}</div>
      <div>Edificio atacado: {buildingInfo.name}</div>
      <div>Guardias muertos: {mission.report.killed_guards.toLocaleString()}</div>
      <div>Saboteadores muertos: {mission.report.killed_sabots.toLocaleString()}</div>
      <div>Ladrones muertos: {mission.report.killed_thiefs.toLocaleString()}</div>
      <div>Edificios destruidos: {mission.report.destroyed_buildings}</div>
      <div>Dinero ganado por edificios: {mission.report.income_from_buildings.toLocaleString()}€</div>
      <div>Dinero ganado por muertes: {mission.report.income_from_troops.toLocaleString()}€</div>
      <div>Dinero ganado por robo: {mission.report.income_from_robbed_money.toLocaleString()}€</div>
      <div>Beneficios netos: {mission.profit.toLocaleString()}€</div>
      <UserActionLinks user={wasIAttacked ? mission.user : mission.target_user} />
    </div>
  )
}
