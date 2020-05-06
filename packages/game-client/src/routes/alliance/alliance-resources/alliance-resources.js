import React from 'react'
import { PERSONNEL_OBJ } from 'shared-lib/personnelUtils'
import PropTypes from 'prop-types'
import { useUserData } from 'lib/user'
import IncContainer from 'components/UI/inc-container'
import UserLink from 'components/UI/user-link'
import AllianceResourceItem from 'components/alliance/alliance-resource-item/alliance-resource-item'
import AllianceBuffs from 'components/alliance/alliance-buffs'

AllianceResources.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResources({ alliance, reloadAllianceData }) {
  const userData = useUserData()

  return (
    <>
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          {Object.values(alliance.resources).map(resourceData => {
            return (
              <AllianceResourceItem
                key={resourceData.resource_id}
                researchs={alliance.researchs}
                resourceData={resourceData}
                userResourceAmount={userData.personnel[resourceData.resource_id] || 0}
                reloadAllianceData={reloadAllianceData}
              />
            )
          })}
        </div>
      </IncContainer>
      <br />
      {userData.alliance_user_rank.permission_activate_buffs && (
        <AllianceBuffs alliance={alliance} reloadAllianceData={reloadAllianceData} />
      )}
      <br />
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h2>Historial de recursos</h2>
          {alliance.resources_log.map(logEntry => {
            const resourceInfo = PERSONNEL_OBJ[logEntry.resource_id]
            const resourceName = resourceInfo?.name || 'Dinero'
            return (
              <div key={Math.random()}>
                <UserLink user={logEntry.user} /> {logEntry.quantity > 0 ? 'metió' : 'sacó'}{' '}
                {Math.abs(logEntry.quantity).toLocaleString()} {resourceName}
              </div>
            )
          })}
        </div>
      </IncContainer>
    </>
  )
}
