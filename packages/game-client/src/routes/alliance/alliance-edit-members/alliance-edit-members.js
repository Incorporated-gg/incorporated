import React, { useState } from 'react'
import PropTypes from 'prop-types'
import api from 'lib/api'
import { reloadUserData } from 'lib/user'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import { useHistory } from 'react-router-dom'
import { PERMISSIONS_OBJECT, PERMISSIONS_LIST } from 'shared-lib/allianceUtils'

AllianceEditMembers.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
export default function AllianceEditMembers({ alliance, reloadAllianceData }) {
  const history = useHistory()
  const defaultRankEdits = {}
  alliance.ranks.forEach(rankMember => {
    defaultRankEdits[rankMember.user.id] = { ...rankMember.rank }
  })

  const [rankEdits, setRankEdits] = useState(defaultRankEdits)

  const saveRankEdit = rankMember => () => {
    const rankEdit = rankEdits[rankMember.user.id]
    const isCurrentlyAdmin = Boolean(alliance.members.find(m => m.user.id === rankMember.user.id).permission_admin)
    const isChangingIsAdmin = Boolean(rankEdit.permission_admin) !== isCurrentlyAdmin
    if (
      isChangingIsAdmin &&
      !window.confirm(
        `Estás seguro de que quieres ${!rankEdit.permission_admin ? 'quitarle' : 'darle'} liderazgo a ${
          rankMember.user.username
        }?`
      )
    )
      return
    api
      .post('/v1/alliance/edit_rank', {
        username: rankMember.user.username,
        ...rankEdit,
      })
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
  }
  const kickMember = rankMember => () => {
    if (!window.confirm(`Estás seguro de que quieres echar a ${rankMember.user.username}?`)) return
    api
      .post('/v1/alliance/kick_member', {
        user_id: rankMember.user.id,
      })
      .then(() => {
        reloadAllianceData()
      })
      .catch(err => {
        alert(err.message)
      })
  }

  const changeRankName = rankMember => e => {
    rankEdits[rankMember.user.id].rank_name = e.target.value
    setRankEdits(Object.assign({}, rankEdits))
  }
  const changePermission = (rankMember, permissionName) => e => {
    rankEdits[rankMember.user.id][permissionName] = e.target.checked
    setRankEdits(Object.assign({}, rankEdits))
  }

  const exitPressed = () => {
    history.push('/alliance')
  }

  return (
    <>
      <IncButton outerStyle={{ display: 'block', marginBottom: 10, textAlign: 'center' }} onClick={exitPressed}>
        VOLVER
      </IncButton>
      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <h3>Editar miembros</h3>
          <table>
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Nombre de rol</th>
                {PERMISSIONS_LIST.map(permissionName => (
                  <th key={permissionName}>{PERMISSIONS_OBJECT[permissionName] || permissionName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alliance.ranks.map(rankMember => {
                const rankEdit = rankEdits[rankMember.user.id]
                return (
                  <tr key={rankMember.user.id}>
                    <td>
                      <b>{rankMember.user.username}</b>
                    </td>
                    <td>
                      <label>
                        <input
                          type="text"
                          value={rankEdit ? rankEdit.rank_name : rankMember.rank_name}
                          onChange={changeRankName(rankMember)}
                        />
                      </label>
                    </td>
                    {PERMISSIONS_LIST.map(permissionName => {
                      return (
                        <td key={permissionName}>
                          <label>
                            <input
                              type="checkbox"
                              checked={rankEdit ? rankEdit[permissionName] : rankMember[permissionName]}
                              onChange={changePermission(rankMember, permissionName)}
                            />
                          </label>
                        </td>
                      )
                    })}
                    <td>
                      <button onClick={saveRankEdit(rankMember)}>Guardar</button>
                    </td>
                    <td>
                      <button onClick={kickMember(rankMember)}>Echar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </IncContainer>
    </>
  )
}
