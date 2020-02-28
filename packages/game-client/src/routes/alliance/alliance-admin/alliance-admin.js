import React from 'react'
import PropTypes from 'prop-types'

// Libs, hooks...
import { useUserData } from 'lib/user'

// Components
import AllianceBuffs from 'components/alliance/alliance-buffs'
import AllianceBadgeCreator from 'components/alliance/alliance-badge-creator'
import AllianceRankEdit from 'components/alliance/alliance-rank-edit'
import AllianceMemberRequests from 'components/alliance/alliance-member-requests'
import AllianceDelete from 'components/alliance/alliance-delete'
import Container from 'components/UI/container'

AllianceAdmin.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceAdmin({ alliance, reloadAllianceData }) {
  const userData = useUserData()

  return (
    <Container darkBg>
      <div style={{ padding: 10 }}>
        <h2>Admin</h2>
        {userData.alliance_user_rank.permission_activate_buffs && (
          <AllianceBuffs alliance={alliance} reloadAllianceData={reloadAllianceData} />
        )}
        <AllianceBadgeCreator alliance={alliance} reloadAllianceData={reloadAllianceData} />
        {(userData.alliance_user_rank.permission_admin ||
          userData.alliance_user_rank.permission_accept_and_kick_members) && (
          <AllianceRankEdit alliance={alliance} reloadAllianceData={reloadAllianceData} />
        )}
        {userData.alliance_user_rank.permission_accept_and_kick_members && (
          <AllianceMemberRequests reloadAllianceData={reloadAllianceData} />
        )}
        {userData.alliance_user_rank.permission_admin && <AllianceDelete reloadAllianceData={reloadAllianceData} />}
      </div>
    </Container>
  )
}
