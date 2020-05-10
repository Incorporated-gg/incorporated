import React from 'react'
import PropTypes from 'prop-types'
import api from 'lib/api'
import styles from './alliance-home.module.scss'
import { useUserData, reloadUserData } from 'lib/user'
import IncContainer from 'components/UI/inc-container'
import AllianceDetails from 'components/alliance/alliance-details/alliance-details'
import AllianceMemberRequests from 'components/alliance/alliance-member-requests'
import IncButton from 'components/UI/inc-button'
import AllianceMembersList from 'components/alliance/alliance-members-list/alliance-members-list'

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
    <>
      <AllianceDetails alliance={alliance} />
      <br />
      {userData.alliance_user_rank.permission_accept_and_kick_members && (
        <AllianceMemberRequests reloadAllianceData={reloadAllianceData} />
      )}
      <AllianceMembersList alliance={alliance} />
      <br />
      <IncContainer darkBg>
        <div className={styles.container}>
          <IncButton onClick={leaveAlliance}>Salir</IncButton>
        </div>
      </IncContainer>
    </>
  )
}
