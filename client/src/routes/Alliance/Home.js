import React from 'react'
import PropTypes from 'prop-types'
import Username from '../../components/Username'
import api from '../../lib/api'
import RankItem from '../../components/RankItem'
import styles from './Home.module.scss'
import { reloadUserData } from '../../lib/user'

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceHome({ alliance, reloadAllianceData }) {
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
            <div>
              {member.rank_name}
              {member.is_admin ? ' (Líder)' : ''}
            </div>
          </RankItem>
        )
      })}
      <br />
      <button onClick={leaveAlliance}>Salir</button>
    </div>
  )
}
