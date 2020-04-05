import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import UserActionLinks from 'components/UI/UserActionLinks'
import styles from './UserProfile.module.scss'
import Stat from 'components/stat'
import Username from 'components/UI/Username'
import Container from 'components/UI/container'
import api from 'lib/api'

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
          <Username user={user} />
        </div>
        <Stat
          img={require('./img/stat-price.png')}
          title={'Posición en ranking'}
          value={user.rank_position.toLocaleString()}
        />
        <Stat
          img={require('./img/stat-income.png')}
          title={'Ingresos diarios'}
          value={`${user.income.toLocaleString()}€`}
        />
        <div className={styles.actionLinks}>
          <UserActionLinks user={user} />
        </div>
      </div>
    </Container>
  )
}
