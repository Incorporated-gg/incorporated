import React from 'react'
import PropTypes from 'prop-types'
import { useUserData } from 'lib/user'
import IncContainer from 'components/UI/inc-container'
import AllianceResourceItem from 'components/alliance/alliance-resource-item/alliance-resource-item'
import AllianceBuffs from 'components/alliance/alliance-buffs'
import AllianceResourcesLog from 'components/alliance/alliance-resources-log/alliance-resources-log'

const mapResourceIDToResearchID = {
  guards: 2,
  sabots: 3,
  thieves: 4,
}

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
          {Object.entries(alliance.resources).map(([resourceID, resourceAmount]) => {
            return (
              <AllianceResourceItem
                key={resourceID}
                resourceID={resourceID}
                resourceAmount={resourceAmount}
                researchID={mapResourceIDToResearchID[resourceID]}
                researchLevel={alliance.researchs[mapResourceIDToResearchID[resourceID]].level}
                userResourceAmount={userData.personnel[resourceID] || 0}
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
