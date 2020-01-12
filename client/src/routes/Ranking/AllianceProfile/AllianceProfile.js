import React, { useState, useEffect, useCallback } from 'react'
import api from '../../../lib/api'
import Username from '../../../components/Username'
import { useParams } from 'react-router-dom'
import { useUserData, reloadUserData } from '../../../lib/user'
import styles from './AllianceProfile.module.scss'
import RankItem from '../../../components/RankItem'

export default function Ranking() {
  const { allianceShortName } = useParams()
  const [alliance, setAlliance] = useState()
  const [error, setError] = useState()
  const userData = useUserData()

  const reloadAllianceData = useCallback(() => {
    api
      .get(`/v1/ranking/alliance/${allianceShortName}`)
      .then(res => {
        setAlliance(res.alliance)
      })
      .catch(err => setError(err.message))
  }, [allianceShortName])

  useEffect(() => {
    reloadAllianceData()
  }, [allianceShortName, reloadAllianceData])

  const createMemberRequest = () => {
    api
      .post('/v1/alliance/member_request/create', { alliance_id: alliance.id })
      .then(() => alert('Petición enviada'))
      .catch(err => alert(err.message))
  }

  const leaveAlliance = () => {
    if (!window.confirm('Estás seguro de que quieres salir?')) return
    api
      .post('/v1/alliance/leave')
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
    <div className={styles.container}>
      <h3>
        {alliance.long_name} ({alliance.short_name})
      </h3>
      <div className={styles.allianceDescText}> {alliance.description}</div>
      <h3>Miembros</h3>
      {alliance.members.map(member => {
        return (
          <RankItem
            key={member.user.id}
            rank={member.user.rank_position}
            pointsString={member.user.income.toLocaleString() + '€'}>
            <div>
              <Username user={member.user} />
            </div>
            <div>
              {member.rank_name}
              {member.is_admin ? ' (Líder)' : ''}
            </div>
          </RankItem>
        )
      })}
      {!userData.alliance && <button onClick={createMemberRequest}>Pedir ser miembro</button>}
      {userData.alliance && userData.alliance.id === alliance.id && <button onClick={leaveAlliance}>Salir</button>}
    </div>
  )
}
