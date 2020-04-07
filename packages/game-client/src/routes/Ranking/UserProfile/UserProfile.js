import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import UserActionLinks from 'components/UI/UserActionLinks'
import styles from './UserProfile.module.scss'
import Container from 'components/UI/container'
import api from 'lib/api'
import UserLink from 'components/UI/UserLink'
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
    <Container darkBg>
      <div className={styles.container}>
        <div className={styles.username}>
          <UserLink user={user} />
        </div>
        <div>Posición en ranking: {user.rank_position.toLocaleString()}</div>
        <div>
          Ingresos diarios: {user.income.toLocaleString()} <Icon iconName="money" size={16} />
        </div>
        <div className={styles.actionLinks}>
          <UserActionLinks user={user} />
        </div>
      </div>
    </Container>
  )
}
