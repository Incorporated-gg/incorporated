import React from 'react'
import PropTypes from 'prop-types'
import UserLink from 'components/UI/user-link'
import RankItem from 'components/UI/rank-item/rank-item'
import styles from './alliance-members-list.module.scss'
import IncContainer from 'components/UI/inc-container'
import IncButton from 'components/UI/inc-button'
import { useHistory } from 'react-router-dom'

AllianceMembersList.propTypes = {
  alliance: PropTypes.object.isRequired,
}
export default function AllianceMembersList({ alliance }) {
  const history = useHistory()

  const editMembersPressed = () => {
    history.push('/alliance/edit-members')
  }

  return (
    <>
      <IncContainer darkBg>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>Lista de miembros</div>
            <IncButton outerStyle={{ marginRight: 5 }} style={{ padding: '5px 20px' }} onClick={editMembersPressed}>
              Editar
            </IncButton>
          </div>

          {alliance.members.map(member => {
            return (
              <RankItem
                key={member.user.id}
                user={member.user}
                rank={member.user.rank_position}
                pointsType="income"
                points={member.user.income}>
                <UserLink user={member.user} />
                <span style={{ marginLeft: 10 }}>{member.rank_name}</span>
              </RankItem>
            )
          })}
        </div>
      </IncContainer>
    </>
  )
}
