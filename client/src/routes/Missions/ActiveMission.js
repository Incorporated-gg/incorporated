import React, { useState, useEffect } from 'react'
import Username from '../../components/Username'
import api from '../../lib/api'
import PropTypes from 'prop-types'
import { buildingsList } from 'shared-lib/buildingsUtils'
import { getTimeUntil } from '../../lib/util'
import { reloadUserData } from '../../lib/user'

ActiveMission.propTypes = {
  mission: PropTypes.object.isRequired,
  reloadMissionsCallback: PropTypes.func.isRequired,
}
export default function ActiveMission({ mission, reloadMissionsCallback }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(mission.will_finish_at * 1000))
  useEffect(() => {
    const int = setInterval(() => setTimeLeft(getTimeUntil(mission.will_finish_at * 1000)))
    return () => clearInterval(int)
  }, [mission.will_finish_at])

  const isCompleting = new Date(mission.will_finish_at * 1000) <= new Date()
  const cancelMission = () => {
    api
      .post('/v1/missions/cancel', { started_at: mission.started_at })
      .then(() => {
        reloadMissionsCallback()
        reloadUserData()
      })
      .catch(err => {
        reloadMissionsCallback()
        alert(err.message)
      })
  }

  return (
    <tr>
      <td>{mission.mission_type}</td>
      <td>
        <Username user={mission.target_user} />
      </td>
      <td>{mission.personnel_sent}</td>
      <td>
        {mission.mission_type === 'attack'
          ? buildingsList.find(b => b.id === parseInt(mission.target_building)).name
          : ''}
      </td>
      <td>{isCompleting ? 'Completando...' : `${timeLeft.minutes}:${timeLeft.seconds}`}</td>
      <td>{isCompleting ? '' : <button onClick={cancelMission}>Cancelar</button>}</td>
    </tr>
  )
}
