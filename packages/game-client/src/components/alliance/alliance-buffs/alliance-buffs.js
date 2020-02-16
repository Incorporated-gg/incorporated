import React from 'react'
import Proptypes from 'prop-types'
import { post } from 'lib/api'

AllianceBuffs.propTypes = {
  alliance: Proptypes.object.isRequired,
  reloadAllianceData: Proptypes.func.isRequired,
}
export default function AllianceBuffs({ alliance, reloadAllianceData }) {
  const activateBuff = buffID => () => {
    if (!window.confirm('Estás seguro de que quieres activar el buff?')) return
    post('/v1/alliance/buffs/activate', {
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
      <h3>Activar buffs</h3>
      <button onClick={activateBuff('attack')} disabled={!alliance.buffs_data.attack.can_activate}>
        Activar buff de ataque
      </button>
      <button onClick={activateBuff('defense')} disabled={!alliance.buffs_data.defense.can_activate}>
        Activar buff de defensa
      </button>
    </div>
  )
}
