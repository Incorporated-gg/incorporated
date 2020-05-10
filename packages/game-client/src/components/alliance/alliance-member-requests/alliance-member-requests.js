import React, { useState, useCallback, useEffect } from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'
import IncContainer from 'components/UI/inc-container'
import Icon from 'components/icon'
import IncButton from 'components/UI/inc-button'
import UserLink from 'components/UI/user-link'
import styles from './alliance-member-requests.module.scss'

MemberRequests.propTypes = {
  reloadAllianceData: PropTypes.func.isRequired,
}

export default function MemberRequests({ reloadAllianceData }) {
  const [error, setError] = useState(null)
  const [memberRequests, setMemberRequests] = useState([])

  const reloadMemberRequests = useCallback(() => {
    api
      .get('/v1/alliance/member_request/list')
      .then(res => {
        setMemberRequests(res.member_requests)
      })
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    reloadMemberRequests()
  }, [reloadMemberRequests])

  const memberRequestAction = (action, memberRequest) => () => {
    api
      .post(`/v1/alliance/member_request/${action}`, { user_id: memberRequest.id })
      .then(() => {
        reloadMemberRequests()
        if (action === 'accept') reloadAllianceData()
      })
      .catch(err => alert(err.message))
  }

  if (error) return <p>{error}</p>
  if (!memberRequests.length) return null
  return (
    <IncContainer darkBg outerStyle={{ marginBottom: 10 }}>
      <div style={{ padding: 10 }}>
        <div className={styles.title}>Solicitudes de membresía</div>
        {memberRequests.map(memberRequest => {
          return (
            <div className={styles.row} key={memberRequest.id}>
              <div style={{ flexGrow: 1 }}>
                <UserLink user={memberRequest} />
              </div>
              <div>
                <IncButton borderSize={2} onClick={memberRequestAction('accept', memberRequest)}>
                  <Icon svg={require('./img/accept.svg')} size={18} style={{ margin: 5 }} />
                </IncButton>{' '}
                <IncButton borderSize={2} onClick={memberRequestAction('reject', memberRequest)}>
                  <Icon svg={require('./img/reject.svg')} size={18} style={{ margin: 5 }} />
                </IncButton>
              </div>
            </div>
          )
        })}
      </div>
    </IncContainer>
  )
}
