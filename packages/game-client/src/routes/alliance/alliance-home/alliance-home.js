import React, { useState } from 'react'
import PropTypes from 'prop-types'
import UserLink from 'components/UI/UserLink'
import api from 'lib/api'
import RankItem from 'components/UI/RankItem'
import styles from './alliance-home.module.scss'
import { useUserData, reloadUserData } from 'lib/user'
import NewMessageModal from '../../../components/messages/components/new-message-modal'
import Container from 'components/UI/container'
import AllianceDetails from 'components/UI/alliance-details'

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceHome({ alliance, reloadAllianceData }) {
  const userData = useUserData()
  const [showMessageModal, setShowMessageModal] = useState(false)
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
    <>
      <Container darkBg>
        <div className={styles.container}>
          <AllianceDetails alliance={alliance} />
          {userData.alliance_user_rank.permission_send_circular_msg && (
            <button onClick={() => setShowMessageModal(true)}>Enviar mensaje circular</button>
          )}{' '}
          <button onClick={leaveAlliance}>Salir</button>
        </div>
      </Container>
      <br />
      <Container darkBg>
        <div className={`${styles.container} ${styles.membersContainer}`}>
          <h3>Miembros</h3>
          {alliance.members.map(member => {
            return (
              <RankItem
                key={member.user.id}
                rank={member.user.rank_position}
                pointsString={member.user.income.toLocaleString() + '€'}>
                <UserLink user={member.user} />
                <span style={{ marginLeft: 10 }}>{member.rank_name}</span>
              </RankItem>
            )
          })}
        </div>
      </Container>
      <NewMessageModal
        user={{ username: `alliance:${alliance.short_name}` }}
        isOpen={showMessageModal}
        onRequestClose={() => setShowMessageModal(false)}
      />
    </>
  )
}
