import React, { useState, useEffect, useCallback } from 'react'
import { get, post } from 'lib/api'
import Username from 'components/UI/Username'
import { useParams } from 'react-router-dom'
import { useUserData, reloadUserData } from 'lib/user'
import styles from './AllianceProfile.module.scss'
import RankItem from 'components/UI/RankItem'
import WarInfo from 'components/alliance/alliance-war-info'
import Container from 'components/UI/container'

export default function Ranking() {
  const { allianceShortName } = useParams()
  const [alliance, setAlliance] = useState()
  const [error, setError] = useState()
  const userData = useUserData()

  const reloadAllianceData = useCallback(() => {
    get(`/v1/ranking/alliance/${allianceShortName}`)
      .then(res => {
        setAlliance(res.alliance)
      })
      .catch(err => setError(err.message))
  }, [allianceShortName])

  useEffect(() => {
    reloadAllianceData()
  }, [allianceShortName, reloadAllianceData])

  const createMemberRequest = () => {
    post('/v1/alliance/member_request/create', { alliance_id: alliance.id })
      .then(() => alert('Petición enviada'))
      .catch(err => alert(err.message))
  }

  const leaveAlliance = () => {
    if (!window.confirm('Estás seguro de que quieres salir?')) return
    post('/v1/alliance/leave')
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }
  const declareWar = () => {
    if (!window.confirm('Estás seguro de que quieres declarar guerra a esta alianza?')) return
    post('/v1/alliance/declare_war', {
      alliance_id: alliance.id,
    })
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  if (error) return <h4>{error}</h4>

  if (!alliance) return <div>Cargando</div>

  return (
    <Container darkBg>
      <div className={styles.container}>
        <h1>
          {alliance.long_name} ({alliance.short_name})
        </h1>
        <div className={styles.allianceDescText}> {alliance.description}</div>
        <h2>Miembros</h2>
        {alliance.members.map(member => {
          return (
            <RankItem
              key={member.user.id}
              rank={member.user.rank_position}
              pointsString={member.user.income.toLocaleString() + '€'}>
              <div>
                <Username user={member.user} />
              </div>
              <div>{member.rank_name}</div>
            </RankItem>
          )
        })}
        <br />
        <h2>Acciones</h2>
        {!userData.alliance ? (
          <button onClick={createMemberRequest}>Pedir ser miembro</button>
        ) : userData.alliance.id === alliance.id ? (
          <button onClick={leaveAlliance}>Salir</button>
        ) : (
          userData.alliance_user_rank.permission_declare_war && <button onClick={declareWar}>Declarar guerra</button>
        )}
        <br />
        <h2>Guerras activas</h2>
        {alliance.active_wars.map(war => {
          return <WarInfo war={war} key={war.id} />
        })}
        <br />
        <h2>Guerras pasadas</h2>
        {alliance.past_wars.map(war => {
          return <WarInfo war={war} key={war.id} />
        })}
      </div>
    </Container>
  )
}
