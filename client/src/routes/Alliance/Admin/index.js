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
  const activateBuff = buffID => () => {
    if (!window.confirm('Estás seguro de que quiered activar el buff?')) return
    api
      .post('/v1/alliance/buffs/activate', {
        buff_id: buffID,
      })
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
        <button onClick={activateBuff('attack')} disabled={!alliance.buffs_data.attack.can_activate}>
          Activar buff de ataque
        </button>
        <button onClick={activateBuff('defense')} disabled={!alliance.buffs_data.defense.can_activate}>
          Activar buff de defensa
        </button>
      </div>
      <RankEdit alliance={alliance} reloadAllianceData={reloadAllianceData} />
      <MemberRequests reloadAllianceData={reloadAllianceData} />
      <div>
        <button onClick={deleteAlliance}>Borrar alianza</button>
      </div>
    </div>
  )
}
