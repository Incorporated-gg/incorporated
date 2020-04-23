import React from 'react'
import styles from './header-right-buttons.module.scss'
import { useUserData } from 'lib/user'
import { Link } from 'react-router-dom'
import Icon from 'components/icon'
import IncContainer from 'components/UI/inc-container'
import PropTypes from 'prop-types'
import IncChevron from 'components/UI/inc-chevron'

HeaderRightButtons.propTypes = {
  setIsActiveTasksModalOpen: PropTypes.func.isRequired,
}
export default function HeaderRightButtons({ setIsActiveTasksModalOpen }) {
  return (
    <div className={styles.rightButtonsContainer}>
      <Link className={styles.rightButtonContainer} to="/finances">
        <IncContainer borderSize={4} withHairline className={styles.rightButtonInner}>
          <IncChevron padding={3} chevronSize={10} direction="right">
            <Icon width={26} height={16} svg={require('./img/finances.svg')} alt="Finances" />
          </IncChevron>
          <div className={styles.title}>TIENDA</div>
        </IncContainer>
      </Link>
      <div
        className={styles.rightButtonContainer}
        onClick={() => setIsActiveTasksModalOpen(true)}
        style={{ cursor: 'pointer', marginTop: 5 }}>
        <IncContainer borderSize={4} withHairline className={styles.rightButtonInner}>
          <IncChevron padding={3} chevronSize={10} direction="right">
            <Icon width={26} height={16} svg={require('./img/tasks.svg')} alt="Tareas" />
          </IncChevron>
          <div className={styles.title}>TAREAS</div>
          <FinishedActiveTasksCounter />
        </IncContainer>
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
