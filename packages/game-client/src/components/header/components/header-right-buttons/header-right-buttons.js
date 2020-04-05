import React from 'react'
import styles from './header-right-buttons.module.scss'
import { useUserData } from 'lib/user'
import { Link } from 'react-router-dom'
import Icon from 'components/icon'
import Container from 'components/UI/container'
import PropTypes from 'prop-types'

HeaderRightButtons.propTypes = {
  setIsActiveTasksModalOpen: PropTypes.func.isRequired,
}
export default function HeaderRightButtons({ setIsActiveTasksModalOpen }) {
  return (
    <div className={styles.rightButtonsContainer}>
      <Link to="/finances">
        <Container outerClassName={styles.rightButton} className={styles.rightButtonInner}>
          <Icon svg={require('./img/finances.svg')} alt="Finances" />
        </Container>
      </Link>
      <div onClick={() => setIsActiveTasksModalOpen(true)}>
        <Container outerClassName={styles.rightButton} className={styles.rightButtonInner}>
          <Icon svg={require('./img/tasks.svg')} alt="Tareas" />
          <FinishedActiveTasksCounter />
        </Container>
      </div>
    </div>
  )
}

function FinishedActiveTasksCounter() {
  const userData = useUserData()
  if (!userData) return null

  const count = userData.activeTasks.filter(task => task.progressPercentage >= 100).length
  if (!count) return null
  return <span className={styles.finishedActiveTasksCounter}>{count}</span>
}
