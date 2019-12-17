import React from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import PropTypes from 'prop-types'
import { userData } from '../../lib/user'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { Link } from 'react-router-dom'
import { personnelList } from 'shared-lib/personnelUtils'
import { researchList } from 'shared-lib/researchUtils'

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
              Saboteadores enviados: {(message.data.surviving_sabots + message.data.sabots_killed).toLocaleString()}
            </div>
            <div>Edificio atacado: {buildingsList.find(b => b.id === message.data.building_id).name}</div>
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
              Saboteadores enviados: {(message.data.surviving_sabots + message.data.sabots_killed).toLocaleString()}
            </div>
            <div>Edificio atacado: {buildingsList.find(b => b.id === message.data.building_id).name}</div>
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
    case 'caught_spies':
      messageElm = (
        <div>
          Hemos cazado a {message.data.captured_spies.toLocaleString()} espías de{' '}
          <Username user={message.data.attacker} /> que nos intentaban robar información confidencial!
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
              de nuestros espías.
            </div>
          )}
          {message.data.intel_report ? (
            <>
              <div>Número de espías: {message.data.spies_count}</div>
              {message.data.intel_report.buildings && (
                <div>
                  <b>{'Edificios: '}</b>
                  {buildingsList
                    .map(buildingInfo => {
                      return buildingInfo.name + ': ' + message.data.intel_report.buildings[buildingInfo.id]
                    })
                    .join(', ')}
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
          ) : (
            <div>No hemos obtenido ninguna información! Tendremos que enviar más espías</div>
          )}
        </div>
      )
      break
    default:
      messageElm = <div>Tipo desconocido</div>
  }

  return (
    <div>
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
      {messageElm}
      <br />
      {wasSentToMe && message.sender && (
        <button>
          <Link to={`/messages/new/${message.sender.username}`}>Responder</Link>
        </button>
      )}
      {wasSentToMe && <button onClick={deleteMessage}>Borrar</button>}
      <hr />
    </div>
  )
}
