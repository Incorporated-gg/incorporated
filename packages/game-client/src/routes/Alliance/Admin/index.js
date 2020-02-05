import React from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'
import RankEdit from './RankEdit'
import MemberRequests from './MemberRequests'
import { useUserData, reloadUserData } from '../../../lib/user'
import BadgeCreator from '../Badge/BadgeCreator'

AllianceAdmin.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceAdmin({ alliance, reloadAllianceData }) {
  const userData = useUserData()

  const deleteAlliance = () => {
    if (!window.confirm('Estás seguro? Todos los recursos de la alianza se perderán')) return
    api
      .post('/v1/alliance/delete')
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }
  const activateBuff = buffID => () => {
    if (!window.confirm('Estás seguro de que quieres activar el buff?')) return
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
      {userData.alliance_user_rank.permission_activate_buffs && (
        <div>
          <h3>Activar buffs</h3>
          <button onClick={activateBuff('attack')} disabled={!alliance.buffs_data.attack.can_activate}>
            Activar buff de ataque
          </button>
          <button onClick={activateBuff('defense')} disabled={!alliance.buffs_data.defense.can_activate}>
            Activar buff de defensa
          </button>
        </div>
      )}
      <BadgeCreator alliance={alliance} reloadAllianceData={reloadAllianceData} />
      {(userData.alliance_user_rank.permission_admin ||
        userData.alliance_user_rank.permission_accept_and_kick_members) && (
        <RankEdit alliance={alliance} reloadAllianceData={reloadAllianceData} />
      )}
      {userData.alliance_user_rank.permission_accept_and_kick_members && (
        <MemberRequests reloadAllianceData={reloadAllianceData} />
      )}
      {userData.alliance_user_rank.permission_admin && (
        <div>
          <h3>Borrar alianza</h3>
          <button onClick={deleteAlliance}>Borrar alianza</button>
        </div>
      )}
    </div>
  )
}
