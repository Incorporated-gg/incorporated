import React from 'react'
import styles from './header-task.module.scss'
import { useUserData } from 'lib/user'
import { post } from 'lib/api'

export default function Task() {
  const userData = useUserData()
  return userData.activeTasks.map(task => {
    const completeTask = () => {
      post('/v1/tasks/complete', { task_id: task.id }).catch(() => {})
    }

    return (
      <div key={task.id} className={styles.headerTask}>
        <div className={styles.tutorialInfo}>
          <p>{task.name}</p>
          <p>{task.progressPercentage} / 100%</p>
          <p>Recompensa: {task.reward.toLocaleString()}€</p>
        </div>
        <button disabled={!task.completed} onClick={completeTask}>
          Completar
        </button>
      </div>
    )
  })
}
