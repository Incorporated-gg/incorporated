import React from 'react'
import PropTypes from 'prop-types'
import WarInfo from 'components/alliance/alliance-war-info'
import IncContainer from 'components/UI/inc-container'
import AllianceWarAidRequests from 'components/alliance/alliance-war-aid-requests/alliance-war-aid-requests'
import { userData } from 'lib/user'

AllianceWars.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceWars({ alliance, reloadAllianceData }) {
  return (
    <>
      {userData.alliance_user_rank.permission_declare_war && <AllianceWarAidRequests />}
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h2>Guerras activas</h2>
          {alliance.active_wars.map(war => {
            return <WarInfo war={war} key={war.id} />
          })}
        </div>
      </IncContainer>
      <br />
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h2>Guerras pasadas</h2>
          {alliance.past_wars.map(war => {
            return <WarInfo war={war} key={war.id} />
          })}
        </div>
      </IncContainer>
    </>
  )
}
