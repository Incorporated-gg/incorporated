import React from 'react'
import styles from './active-tasks-modal.module.scss'
import { useUserData } from 'lib/user'
import api from 'lib/api'
import { buildingsList } from 'shared-lib/buildingsUtils'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import IncContainer from 'components/UI/inc-container'
import { numberToAbbreviation } from 'lib/utils'
import Icon from 'components/icon'
import IncProgressBar from 'components/UI/inc-progress-bar'
import IncChevron from 'components/UI/inc-chevron'
import IncButton from 'components/UI/inc-button'

ActiveTasksModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
export default function ActiveTasksModal({ isOpen, onRequestClose }) {
  const userData = useUserData()
  return (
    <Modal overlayClassName="backdropBlur" isOpen={isOpen} onRequestClose={onRequestClose}>
      <IncContainer darkBg noBackground>
        <div>
          <div className={styles.title}>TAREAS</div>
        </div>
        {userData.activeTasks.map(task => (
          <ActiveTask key={task.id} task={task} />
        ))}
      </IncContainer>
    </Modal>
  )
}

ActiveTask.propTypes = {
  task: PropTypes.object.isRequired,
}
function ActiveTask({ task }) {
  let taskElm
  switch (task.type) {
    case 'cyclic_build': {
      const buildingInfo = buildingsList.find(b => b.id === task.requirements.buildingID)
      const newStr = buildingInfo.nameGender === 'masc' ? 'nuevos' : 'nuevas'
      taskElm = `Construye ${task.requirements.amount.toLocaleString()} ${buildingInfo.name} ${newStr}`
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
          Roba {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={26} />
        </>
      )
      break
    }
    case 'cyclic_income': {
      taskElm = (
        <>
          Mejora tus ingresos en {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={26} />
        </>
      )
      break
    }
    case 'barrier_income': {
      taskElm = (
        <>
          Alcanza {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={26} /> de ingresos
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
          Recoge {numberToAbbreviation(task.requirements.amount)} <Icon iconName="money" size={26} /> de tus edificios
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

  const isCompleted = task.progressPercentage >= 100
  const progressAmount = Math.round((task.progressPercentage / 100) * task.requirements.amount)

  const completeTask = () => {
    if (!isCompleted) return
    api.post('/v1/tasks/complete', { task_id: task.id }).catch(() => {})
  }

  return (
    <div key={task.id} className={styles.innerContainer}>
      <div className={styles.taskTitle}>{taskElm}</div>
      <br />
      <IncContainer className={styles.progressContainer}>
        <div className={styles.progressTotal}>{numberToAbbreviation(task.requirements.amount)}</div>
        <IncProgressBar direction="horizontal" progressPercentage={task.progressPercentage}>
          {numberToAbbreviation(progressAmount)}
        </IncProgressBar>
      </IncContainer>
      <br />
      <IncButton disabled={!isCompleted} outerClassName={styles.rewardContainer} onClick={completeTask}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IncChevron padding={10} direction="right" className={styles.taskRewardChevron} />
          <div className={styles.taskRewardText}>
            Recompensa: {numberToAbbreviation(task.reward)} <Icon iconName="money" size={22} />
          </div>
          <IncChevron padding={10} direction="left" className={styles.taskRewardChevron} />
        </div>
        {isCompleted && <div className={styles.claimReward}>RECLAMAR</div>}
      </IncButton>
    </div>
  )
}
