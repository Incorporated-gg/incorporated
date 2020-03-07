import React from 'react'
import styles from './active-tasks-modal.module.scss'
import { useUserData } from 'lib/user'
import { post } from 'lib/api'
import { buildingsList } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import Container from 'components/UI/container'
import cardStyles from 'components/card/card.module.scss'
import { numberToAbbreviation } from 'lib/utils'
import Icon from 'components/icon'

ActiveTasksModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function ActiveTasksModal({ isOpen, onRequestClose }) {
  return (
    <Modal overlayClassName="backdropBlur" isOpen={isOpen} onRequestClose={onRequestClose}>
      <ActiveTasksList />
    </Modal>
  )
}

function ActiveTasksList() {
  const userData = useUserData()
  return userData.activeTasks.map(task => {
    const completeTask = () => {
      post('/v1/tasks/complete', { task_id: task.id }).catch(() => {})
    }

    let taskElm
    switch (task.type) {
      case 'cyclic_build': {
        const buildingInfo = buildingsList.find(b => b.id === task.requirements.buildingID)
        taskElm = `Construye ${task.requirements.amount.toLocaleString()} ${buildingInfo.name}`
        break
      }
      case 'cyclic_attack': {
        taskElm = `Ataca con éxito ${task.requirements.amount.toLocaleString()} veces`
        break
      }
      case 'cyclic_research': {
        taskElm = `Mejora tus investigaciones ${task.requirements.amount.toLocaleString()} veces`
        break
      }
      case 'cyclic_rob': {
        taskElm = (
          <>
            Roba {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={20} />
          </>
        )
        break
      }
      case 'cyclic_income': {
        taskElm = (
          <>
            Mejora tus ingresos en {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={20} />
          </>
        )
        break
      }
      case 'barrier_income': {
        taskElm = (
          <>
            Alcanza {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={20} /> de ingresos
            diarios
          </>
        )
        break
      }
      case 'barrier_research': {
        taskElm = `Alcanza un total de ${task.requirements.amount.toLocaleString()} investigaciones`
        break
      }
      case 'barrier_centraloffice': {
        taskElm = `Alcanza el nivel ${task.requirements.amount.toLocaleString()} de Oficina Central`
        break
      }
      case 'custom_bank': {
        taskElm = `Alcanza el nivel ${task.requirements.amount.toLocaleString()} de Banco`
        break
      }
      case 'cyclic_extract_money': {
        taskElm = (
          <>
            Recoge {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={20} /> de tus edificios
          </>
        )
        break
      }
      case 'custom_join_alliance': {
        taskElm = `Crea o únete a una alianza`
        break
      }
      default: {
        taskElm = 'Unknown task'
      }
    }

    return (
      <Container key={task.id} outerClassName={styles.headerTaskOuter} className={styles.headerTask} darkBg>
        <div className={styles.tutorialInfo}>
          <div>{taskElm}</div>
          <br />
          <div className={cardStyles.buttonNumberContainer}>
            <div className={cardStyles.buttonNumberProgress} style={{ width: task.progressPercentage + '%' }} />
            <div className={cardStyles.buttonNumberText}>{task.progressPercentage} / 100%</div>
          </div>
          <br />
          <div>
            Recompensa: {numberToAbbreviation(task.reward)} <Icon iconName="money" size={20} />
          </div>
        </div>
        <div>
          <button disabled={task.progressPercentage < 100} onClick={completeTask}>
            Completar
          </button>
        </div>
      </Container>
    )
  })
}
