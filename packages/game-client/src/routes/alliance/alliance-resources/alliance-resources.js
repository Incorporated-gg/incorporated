import React from 'react'
import PropTypes from 'prop-types'
import { useUserData } from 'lib/user'
import IncContainer from 'components/UI/inc-container'
import AllianceResourceItem from 'components/alliance/alliance-resource-item/alliance-resource-item'
import AllianceBuffs from 'components/alliance/alliance-buffs'
import AllianceResourcesLog from 'components/alliance/alliance-resources-log/alliance-resources-log'

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
      <AllianceResourcesLog resourcesLog={alliance.resources_log} />
    </>
  )
}
