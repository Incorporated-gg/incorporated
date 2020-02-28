import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Username from 'components/UI/Username'
import { post } from 'lib/api'
import RankItem from 'components/UI/RankItem'
import styles from './alliance-home.module.scss'
import { useUserData, reloadUserData } from 'lib/user'
import NewMessageModal from '../../../components/messages/components/new-message-modal'
import Container from 'components/UI/container'

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceHome({ alliance, reloadAllianceData }) {
  const userData = useUserData()
  const [showMessageModal, setShowMessageModal] = useState(false)
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

  return (
    <Container darkBg>
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
            <button onClick={() => setShowMessageModal(true)}>Enviar mensaje circular</button>
          </>
        )}
        <button onClick={leaveAlliance}>Salir</button>
        <NewMessageModal
          user={{ username: `alliance:${alliance.short_name}` }}
          isOpen={showMessageModal}
          onRequestClose={() => setShowMessageModal(false)}
        />
      </div>
    </Container>
  )
}
