import React from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'
import RankEdit from './RankEdit'
import MemberRequests from './MemberRequests'

AllianceAdmin.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceAdmin({ alliance, reloadAllianceData }) {
  const deleteAlliance = () => {
    if (!window.confirm('Estás seguro? Todos los recursos de la alianza se perderán')) return
    api
      .post('/v1/alliance/delete')
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <div>
      <h2>Admin</h2>
      <div>
        <button onClick={deleteAlliance}>Borrar alianza</button>
      </div>
      <RankEdit alliance={alliance} reloadAllianceData={reloadAllianceData} />
      <MemberRequests reloadAllianceData={reloadAllianceData} />
    </div>
  )
}
