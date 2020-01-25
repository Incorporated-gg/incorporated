import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Username from '../../components/Username'
import api from '../../lib/api'
import RankItem from '../../components/RankItem'
import styles from './Home.module.scss'
import { useUserData, reloadUserData } from '../../lib/user'

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceHome({ alliance, reloadAllianceData }) {
  const userData = useUserData()
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
            <div>{member.rank_name}</div>
          </RankItem>
        )
      })}
      {userData.alliance_user_rank.permission_send_circular_msg && (
        <>
          <hr />
          <Link className={styles.button} to={`/messages/new/alliance:${alliance.short_name}`}>
            Enviar mensaje circular
          </Link>
        </>
      )}
      <button onClick={leaveAlliance}>Salir</button>
    </div>
  )
}
