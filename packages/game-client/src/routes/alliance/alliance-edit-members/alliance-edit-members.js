import React, { useState } from 'react'
import PropTypes from 'prop-types'
import api from 'lib/api'
import { reloadUserData } from 'lib/user'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import { useHistory } from 'react-router-dom'
import { PERMISSIONS_OBJECT, PERMISSIONS_LIST } from 'shared-lib/allianceUtils'
import styles from './alliance-edit-members.module.scss'
import IncInput from 'components/UI/inc-input/inc-input'
import UserLink from 'components/UI/user-link'

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
  const changeRankName = rankMember => newVal => {
    rankEdits[rankMember.user.id].rank_name = newVal
    setRankEdits(Object.assign({}, rankEdits))
  }
  const changePermission = (rankMember, permissionName) => newVal => {
    rankEdits[rankMember.user.id][permissionName] = newVal
    setRankEdits(Object.assign({}, rankEdits))
  }

  const savePressed = () => {
    const allEditsPromises = Object.entries(rankEdits).map(async ([userID, rankEdit]) => {
      const rankMember = alliance.members.find(m => m.user.id === parseInt(userID))
      if (!rankMember) return // probably was kicked
      const initialRank = defaultRankEdits[rankMember.user.id]
      if (JSON.stringify(initialRank) === JSON.stringify(rankEdit)) return

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

      await api.post('/v1/alliance/edit_rank', {
        username: rankMember.user.username,
        ...rankEdit,
      })
    })

    Promise.all(allEditsPromises)
      .then(() => {
        reloadAllianceData()
        reloadUserData()
      })
      .catch(err => {
        alert(err.message)
      })
    history.push('/alliance')
  }

  return (
    <>
      <IncButton outerClassName={styles.saveButton} onClick={savePressed}>
        GUARDAR
      </IncButton>

      <IncContainer darkBg>
        <div style={{ padding: 10 }}>
          <div className={styles.title}>Editar miembros</div>
          <table>
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Rol</th>
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
                      <UserLink user={rankMember.user} />
                    </td>
                    <td>
                      <label>
                        <IncInput
                          showBorder
                          type="text"
                          value={rankEdit ? rankEdit.rank_name : rankMember.rank_name}
                          onChangeText={changeRankName(rankMember)}
                          style={{ width: 120 }}
                        />
                      </label>
                    </td>
                    {PERMISSIONS_LIST.map(permissionName => {
                      return (
                        <td key={permissionName}>
                          <IncInput
                            type="checkbox"
                            checked={rankEdit ? rankEdit[permissionName] : rankMember[permissionName]}
                            onChangeText={changePermission(rankMember, permissionName)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </IncContainer>
      <br />
      <AllianceKickMembers reloadAllianceData={reloadAllianceData} alliance={alliance} />
    </>
  )
}

AllianceKickMembers.propTypes = {
  alliance: PropTypes.object.isRequired,
  reloadAllianceData: PropTypes.func.isRequired,
}
function AllianceKickMembers({ alliance, reloadAllianceData }) {
  const [member, setMember] = useState(alliance.members[0].user.username)
  const membersObj = {}
  alliance.members.forEach(memb => {
    membersObj[memb.user.username] = memb.user.username
  })

  const kickMember = () => {
    const rankMember = alliance.members.find(m => m.user.username === member)
    if (!window.confirm(`Estás seguro de que quieres echar a ${rankMember.user.username}?`)) return
    api
      .post('/v1/alliance/kick_member', {
        user_id: rankMember.user.id,
      })
      .then(async () => {
        await reloadAllianceData()
        setMember(alliance.members[0].user.username)
      })
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <IncContainer darkBg>
      <div style={{ padding: 10 }}>
        <div className={styles.title}>Echar miembros</div>
        <IncInput showBorder type="select" options={membersObj} value={member} onChangeText={setMember} />{' '}
        <IncButton onClick={kickMember}>{`Echar a ${member}`}</IncButton>
      </div>
    </IncContainer>
  )
}
