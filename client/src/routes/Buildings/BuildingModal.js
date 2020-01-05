import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { researchList } from 'shared-lib/researchUtils'
import BuildingItem from './BuildingItem'
import OptimizeResearch from './OptimizeResearch'

BuildingModal.propTypes = {
  initialBuildingID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRequestClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  buildings: PropTypes.object,
  updateBuildingN: PropTypes.func.isRequired,
}
export default function BuildingModal({ initialBuildingID, isOpen, onRequestClose, buildings, updateBuildingN }) {
  let content
  if (initialBuildingID === 'OptimizeResearch') {
    content = (
      <>
        <h1>{researchList[5].name}</h1>
        <OptimizeResearch buildings={buildings} />
      </>
    )
  } else {
    const buildingInfo = buildingsList.find(b => b.id === initialBuildingID)
    const buildingCount = buildings ? buildings[initialBuildingID] : 0
    content = (
      <>
        <h1>{buildingInfo.name}</h1>
        <BuildingItem buildingInfo={buildingInfo} buildingCount={buildingCount} updateBuildingN={updateBuildingN} />
      </>
    )
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} closeTimeoutMS={200}>
      {content}
    </Modal>
  )
}
