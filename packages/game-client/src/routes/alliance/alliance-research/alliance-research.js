import React from 'react'
import PropTypes from 'prop-types'
import AllianceResearchItem from 'components/alliance/alliance-research-item/alliance-research-item'
import CardList from 'components/card/card-list'
import AllianceResearchLog from 'components/alliance/alliance-research-log/alliance-research-log'

AllianceResearch.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceResearch({ alliance, reloadAllianceData }) {
  return (
    <>
      <CardList>
        {Object.values(alliance.researchs).map(researchData => {
          return (
            <AllianceResearchItem
              key={researchData.id}
              researchData={researchData}
              reloadAllianceData={reloadAllianceData}
            />
          )
        })}
      </CardList>
      <br />
      <AllianceResearchLog alliance={alliance} />
    </>
  )
}
