import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import UserActionButtons from 'components/UI/user-action-buttons/user-action-buttons'
import styles from './UserProfile.module.scss'
import IncContainer from 'components/UI/inc-container'
import api from 'lib/api'
import UserLink from 'components/UI/user-link'
import Icon from 'components/icon'

export default function Ranking() {
  const { username: routeUsername } = useParams()
  const [user, setUser] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    api
      .get('/v1/ranking/user', { username: routeUsername })
      .then(res => {
        setUser(res.user)
      })
      .catch(err => setError(err.message))
  }, [routeUsername])

  if (error) return <h4>{error}</h4>

  if (!user) return <div>Cargando</div>

  return (
    <IncContainer darkBg>
      <div className={styles.container}>
        <div className={styles.username}>
          <UserLink user={user} />
        </div>
        <div>Posición en ranking: {user.rank_position.toLocaleString()}</div>
        <div>Puntos de servidor: {user.server_points.toLocaleString()}</div>
        <div>
          Ingresos diarios: {user.income.toLocaleString()} <Icon iconName="money" size={16} />
        </div>
        <div className={styles.actionLinks}>
          <UserActionButtons user={user} />
        </div>
      </div>
    </IncContainer>
  )
}
