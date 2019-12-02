import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'

AllianceAdmin.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceAdmin({ alliance, reloadAllianceData }) {
  const defaultRankEdits = {}
  alliance.members.forEach(member => {
    defaultRankEdits[member.user.id] = {
      rank_name: member.rank_name,
      is_admin: member.is_admin,
    }
  })

  const [rankEdits, setRankEdits] = useState(defaultRankEdits)

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

  const saveRankEdit = member => () => {
    const rankEdit = rankEdits[member.user.id]
    const isCurrentlyAdmin = Boolean(alliance.members.find(m => m.user.id === member.user.id).is_admin)
    const isChangingIsAdmin = Boolean(rankEdit.is_admin) !== isCurrentlyAdmin
    if (
      isChangingIsAdmin &&
      !window.confirm(
        `Estás seguro de que quieres ${!rankEdit.is_admin ? 'quitarle' : 'darle'} liderazgo a ${member.user.username}?`
      )
    )
      return
    api
      .post('/v1/alliance/edit_rank', {
        username: member.user.username,
        is_admin: rankEdit.is_admin,
        rank_name: rankEdit.rank_name,
      })
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  const changeRankName = member => e => {
    rankEdits[member.user.id].rank_name = e.target.value
    setRankEdits(Object.assign({}, rankEdits))
  }
  const changeIsAdmin = member => e => {
    rankEdits[member.user.id].is_admin = e.target.checked
    setRankEdits(Object.assign({}, rankEdits))
  }

  return (
    <div>
      <h2>Admin</h2>
      <div>
        <button onClick={deleteAlliance}>Borrar alianza</button>
      </div>
      <div>
        <table>
          <tbody>
            {alliance.members.map(member => {
              const rankEdit = rankEdits[member.user.id]
              return (
                <tr key={member.user.id}>
                  <td>
                    {member.user.username}
                    {member.is_admin ? ' (Líder)' : ''}
                  </td>
                  <td>
                    <label>
                      {'Nombre de rol: '}
                      <input
                        type="text"
                        value={rankEdit ? rankEdit.rank_name : member.rank_name}
                        onChange={changeRankName(member)}
                      />
                    </label>
                  </td>
                  <td>
                    <label>
                      {'Es líder: '}
                      <input
                        type="checkbox"
                        checked={rankEdit ? rankEdit.is_admin : member.is_admin}
                        onChange={changeIsAdmin(member)}
                      />
                    </label>
                  </td>
                  <td>
                    <button onClick={saveRankEdit(member)}>Guardar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
