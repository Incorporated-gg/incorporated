import React, { useState, useCallback, useEffect } from 'react'
import api from '../../../lib/api'
import PropTypes from 'prop-types'
import Container from 'components/UI/container'

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
    <Container darkBg outerStyle={{ marginBottom: 10 }}>
      <div style={{ padding: 10 }}>
        <h3>Solicitudes de membresía</h3>
        <table>
          <tbody>
            {memberRequests.map(memberRequest => {
              return (
                <tr key={memberRequest.id}>
                  <td>{memberRequest.username}</td>
                  <td>
                    <button onClick={memberRequestAction('reject', memberRequest)}>Rechazar</button>
                    <button onClick={memberRequestAction('accept', memberRequest)}>Aceptar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Container>
  )
}
