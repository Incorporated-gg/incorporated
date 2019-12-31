import React from 'react'
import MissionAttack from './MissionAttack'
import MissionSpy from './MissionSpy'
import MissionSimulate from './MissionSimulate'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

Mission.propTypes = {
  reloadMissionsCallback: PropTypes.func.isRequired,
}
export default function Mission({ reloadMissionsCallback }) {
  let { missionType } = useParams('missionType')
  if (!missionType) missionType = 'attack'

  return missionType === 'attack' ? (
    <MissionAttack reloadMissionsCallback={reloadMissionsCallback} />
  ) : missionType === 'spy' ? (
    <MissionSpy reloadMissionsCallback={reloadMissionsCallback} />
  ) : missionType === 'simulator' ? (
    <MissionSimulate />
  ) : (
    <div>?</div>
  )
}
