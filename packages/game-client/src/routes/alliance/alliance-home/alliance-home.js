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
import AllianceMemberRequests from 'components/alliance/alliance-member-requests'
import IncButton from 'components/UI/inc-button'
import { useHistory } from 'react-router-dom'

AllianceHome.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceHome({ alliance, reloadAllianceData }) {
  const history = useHistory()
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
  const editMembersPressed = () => {
    history.push('/alliance/edit-members')
  }

  return (
    <>
      <AllianceDetails alliance={alliance} />
      <br />
      {userData.alliance_user_rank.permission_accept_and_kick_members && (
        <AllianceMemberRequests reloadAllianceData={reloadAllianceData} />
      )}
      <Container darkBg>
        <div className={`${styles.container} ${styles.membersContainer}`}>
          <h3>Lista de miembros</h3>
          <IncButton
            outerStyle={{ float: 'right' }}
            style={{ padding: '5px 20px' }}
            onClick={() => setShowMessageModal(true)}>
            Mandar circular
          </IncButton>
          <IncButton
            outerStyle={{ float: 'right', marginRight: 10 }}
            style={{ padding: '5px 20px' }}
            onClick={editMembersPressed}>
            Editar
          </IncButton>
          {alliance.members.map(member => {
            return (
              <RankItem
                key={member.user.id}
                rank={member.user.rank_position}
                pointsType="income"
                points={member.user.income}>
                <UserLink user={member.user} />
                <span style={{ marginLeft: 10 }}>{member.rank_name}</span>
              </RankItem>
            )
          })}
        </div>
      </Container>
      <br />
      <Container darkBg>
        <div className={styles.container}>
          <IncButton onClick={leaveAlliance}>Salir</IncButton>
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
