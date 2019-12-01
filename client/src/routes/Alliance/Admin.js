import React from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'

AllianceAdmin.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceAdmin({ alliance, reloadAllianceData }) {
  const deleteAlliance = () => {
    api
      .post('/v1/delete_alliance')
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
      <button onClick={deleteAlliance}>Borrar alianza</button>
    </div>
  )
}
