import React from 'react'
import Proptypes from 'prop-types'
import { post } from 'lib/api'
import { reloadUserData } from 'lib/user'

AllianceDelete.propTypes = {
  reloadAllianceData: Proptypes.func.isRequired,
}
export default function AllianceDelete({ reloadAllianceData }) {
  const deleteAlliance = () => {
    if (!window.confirm('Estás seguro? Todos los recursos de la alianza se perderán')) return
    post('/v1/alliance/delete')
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }
  return (
    <div>
      <h3>Borrar alianza</h3>
      <button onClick={deleteAlliance}>Borrar alianza</button>
    </div>
  )
}