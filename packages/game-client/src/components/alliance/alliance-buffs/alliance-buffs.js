import React from 'react'
import Proptypes from 'prop-types'
import api from 'lib/api'
import Container from 'components/UI/container'
import IncButton from 'components/UI/inc-button'

AllianceBuffs.propTypes = {
  alliance: Proptypes.object.isRequired,
  reloadAllianceData: Proptypes.func.isRequired,
}
export default function AllianceBuffs({ alliance, reloadAllianceData }) {
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
    <Container darkBg>
      <div style={{ padding: 10 }}>
        <IncButton onClick={activateBuff('attack')} disabled={!alliance.buffs_data.attack.can_activate}>
          Activar buff de ataque
        </IncButton>{' '}
        <IncButton onClick={activateBuff('defense')} disabled={!alliance.buffs_data.defense.can_activate}>
          Activar buff de defensa
        </IncButton>
      </div>
    </Container>
  )
}
