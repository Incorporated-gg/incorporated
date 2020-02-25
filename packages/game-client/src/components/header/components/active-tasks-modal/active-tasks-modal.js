import React from 'react'
import styles from './active-tasks-modal.module.scss'
import { useUserData } from 'lib/user'
import { post } from 'lib/api'
import { buildingsList } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import Modal from 'react-modal'

ActiveTasksModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function ActiveTasksModal({ isOpen, onRequestClose }) {
  return (
    <Modal overlayClassName="backdropBlur" isOpen={isOpen} onRequestClose={onRequestClose} className={styles.modal}>
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

    let taskName = ''
    switch (task.type) {
      case 'cyclic_build': {
        const buildingInfo = buildingsList.find(b => b.id === task.requirements.buildingID)
        taskName = `Construye ${task.requirements.amount.toLocaleString()} ${buildingInfo.name}`
        break
      }
      case 'cyclic_attack': {
        taskName = `Ataca con éxito ${task.requirements.amount.toLocaleString()} veces`
        break
      }
      case 'cyclic_research': {
        taskName = `Mejora tus investigaciones ${task.requirements.amount.toLocaleString()} veces`
        break
      }
      case 'cyclic_rob': {
        taskName = `Roba ${task.requirements.amount.toLocaleString()}€`
        break
      }
      case 'cyclic_income': {
        taskName = `Mejora tus ingresos en ${task.requirements.amount.toLocaleString()}€`
        break
      }
      case 'barrier_income': {
        taskName = `Alcanza ${task.requirements.amount.toLocaleString()}€ de ingresos diarios`
        break
      }
      case 'barrier_research': {
        taskName = `Alcanza un total de ${task.requirements.amount.toLocaleString()} investigaciones`
        break
      }
      case 'barrier_centraloffice': {
        taskName = `Alcanza el nivel ${task.requirements.amount.toLocaleString()} de Oficina Central`
        break
      }
      case 'custom_bank': {
        taskName = `Alcanza el nivel ${task.requirements.amount.toLocaleString()} de Banco`
        break
      }
      case 'custom_extract_money': {
        taskName = `Obtén ${task.requirements.amount.toLocaleString()}€ en total, extrayendo dinero de tus edificios`
        break
      }
      case 'custom_join_alliance': {
        taskName = `Crea o únete a una alianza`
        break
      }
      default: {
        taskName = 'Unknown task'
      }
    }

    return (
      <div key={task.id} className={styles.headerTask}>
        <div className={styles.tutorialInfo}>
          <p>{taskName}</p>
          <p>{task.progressPercentage} / 100%</p>
          <p>Recompensa: {task.reward.toLocaleString()}€</p>
        </div>
        <button disabled={task.progressPercentage < 100} onClick={completeTask}>
          Completar
        </button>
      </div>
    )
  })
}
