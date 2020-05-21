import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import UserActionButtons from '../../components/UI/user-action-buttons/user-action-buttons'
import IncContainer from 'components/UI/inc-container'
import UserLink from 'components/UI/user-link'
import PropTypes from 'prop-types'
import styles from './contest.module.scss'
import { contestIDToName } from 'lib/utils'

Contest.propTypes = {
  contestID: PropTypes.string.isRequired,
}
export default function Contest({ contestID }) {
  const [contestScores, setContestScores] = useState()
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get(`/v1/contests/${contestID}`)
      .then(res => {
        setContestScores(res.contestInfo)
      })
      .catch(err => setError(err.message))
  }, [contestID])

  return (
    <IncContainer darkBg>
      <div className={styles.container}>
        {error && <h4>{error}</h4>}
        <div className={styles.title}>{contestIDToName(contestID)}</div>
        <div className={styles.subtitle}>
          Los premios son repartidos cada lunes a las 00:00 hora servidor, y cada semana cambia la categoría.
        </div>
        <table>
          <tbody>
            {contestScores ? (
              contestScores.map(contestScore => (
                <tr key={contestScore.user.id}>
                  <td className={styles.rankTd}>{contestScore.rank && contestScore.rank.toLocaleString()}</td>
                  <td>
                    <UserLink user={contestScore.user} />
                  </td>
                  <td>{contestScore.score && contestScore.score.toLocaleString()}</td>
                  <td>
                    <UserActionButtons user={contestScore.user} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </IncContainer>
  )
}
