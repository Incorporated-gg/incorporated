import React from 'react'
import PropTypes from 'prop-types'
import WarInfo from './WarInfo'

AllianceWars.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceWars({ alliance, reloadAllianceData }) {
  return (
    <>
      <h2>Guerras activas</h2>
      {alliance.active_wars.map(war => {
        return <WarInfo war={war} key={war.id} />
      })}
      <h2>Guerras pasadas</h2>
      {alliance.past_wars.map(war => {
        return <WarInfo war={war} key={war.id} />
      })}
    </>
  )
}
