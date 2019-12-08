import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import PropTypes from 'prop-types'
import { userData } from '../../lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'

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

SingleMessage.propTypes = {
  message: PropTypes.object.isRequired,
  reloadMessagesData: PropTypes.func.isRequired,
}
function SingleMessage({ reloadMessagesData, message }) {
  const deleteMessage = e => {
    e.preventDefault()
    api
      .post(`/v1/messages/delete`, { message_id: message.id })
      .then(() => reloadMessagesData())
      .catch(err => {
        alert(err.message)
      })
  }
  const isMine = message.receiver && message.receiver.id === userData.id
  const dateFormatted = new Date(message.created_at * 1000).toLocaleString()

  let messageElm = null
  switch (message.type) {
    case 'private_message':
      messageElm = <div>{message.data.message}</div>
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
    case 'attack_report':
      const wasIAttacked = message.data.defender && message.data.defender.id === userData.id
      if (wasIAttacked) {
        messageElm = (
          <div>
            <div>
              Ataque recibido de <Username user={message.data.attacker} />
            </div>
            <div>Resultado: {message.data.result}</div>
            <div>
              Saboteadores enviados: {(message.data.surviving_sabots - message.data.sabots_killed).toLocaleString()}
            </div>
            <div>Guardias muertos: {message.data.guards_killed.toLocaleString()}</div>
            <div>Saboteadores muertos: {message.data.sabots_killed.toLocaleString()}</div>
            <div>Edificios destruidos: {message.data.destroyed_buildings}</div>
            <div>Dinero ganado por edificios: {message.data.income_for_buildings.toLocaleString()}</div>
            <div>Dinero ganado por muertes: {message.data.income_for_troops.toLocaleString()}</div>
            <div>Beneficios netos: {message.data.attacker_profit.toLocaleString()}</div>
          </div>
        )
      } else {
        messageElm = (
          <div>
            <div>
              Ataque a <Username user={message.data.defender} />
            </div>
            <div>Resultado: {message.data.result}</div>
            <div>
              Saboteadores enviados: {(message.data.surviving_sabots - message.data.sabots_killed).toLocaleString()}
            </div>
            <div>Guardias muertos: {message.data.guards_killed.toLocaleString()}</div>
            <div>Saboteadores muertos: {message.data.sabots_killed.toLocaleString()}</div>
            <div>Edificios destruidos: {message.data.destroyed_buildings}</div>
            <div>Dinero ganado por edificios: {message.data.income_for_buildings.toLocaleString()}</div>
            <div>Dinero ganado por muertes: {message.data.income_for_troops.toLocaleString()}</div>
            <div>Beneficios netos: {message.data.attacker_profit.toLocaleString()}</div>
          </div>
        )
      }
      break
    case 'caught_hackers':
      messageElm = (
        <div>
          Hemos cazado a {message.data.hackers_count.toLocaleString()} hackers de{' '}
          <Username user={message.data.attacker} /> que nos intentaban robar información confidencial!
        </div>
      )
      break
    case 'hack_report':
      messageElm = (
        <div>
          <div>
            Resultado de hackeo a: <Username user={message.data.defender} />
          </div>
          {message.data.intel_report ? (
            <>
              <div>Número de hackers: {message.data.hackers_count}</div>
              {message.data.intel_report.buildings && (
                <div>
                  {'Edificios: '}
                  {buildingsList
                    .map(buildingInfo => {
                      return buildingInfo.name + ': ' + message.data.intel_report.buildings[buildingInfo.id]
                    })
                    .join(', ')}{' '}
                </div>
              )}
              {message.data.intel_report.personnel && (
                <div>
                  {'Personal: '}
                  {JSON.stringify(message.data.intel_report.personnel)}{' '}
                </div>
              )}
              {message.data.intel_report.researchs && (
                <div>
                  {'Investigaciones: '}
                  {JSON.stringify(message.data.intel_report.researchs)}{' '}
                </div>
              )}
            </>
          ) : (
            <div>Nos cazaron! Hemos perdido a {message.data.hackers_count} hackers</div>
          )}
        </div>
      )
      break
    default:
      messageElm = <div>Tipo desconocido</div>
  }

  return (
    <div>
      {isMine && message.sender && (
        <div>
          {'Enviado por: '}
          <Username user={message.sender} />
        </div>
      )}
      {!isMine && message.receiver && (
        <div>
          {'Enviado a: '}
          <Username user={message.receiver} />
        </div>
      )}
      <div>Fecha: {dateFormatted}</div>
      {messageElm}
      {isMine && <button onClick={deleteMessage}>Borrar</button>}
      <hr />
    </div>
  )
}
