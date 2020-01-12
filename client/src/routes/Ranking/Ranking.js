import React, { useState, useEffect } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import { Link, useLocation } from 'react-router-dom'
import styles from './Ranking.module.scss'
import RankItem from '../../components/RankItem'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [error, setError] = useState(false)
  const { pathname } = useLocation()
  let type = pathname.split('/').pop()
  if (type === 'ranking') type = 'income'

  useEffect(() => {
    api
      .get('/v1/ranking', { type })
      .then(res => {
        setRanking(res.ranking)
      })
      .catch(err => setError(err.message))
  }, [type])

  if (error) return <h4>{error}</h4>

  return (
    <div className={styles.rankingContainer}>
      {ranking.map(rankItem => (
        <RankItem
          key={rankItem.user ? rankItem.user.id : rankItem.alliance ? rankItem.alliance.id : Math.random()}
          rank={rankItem.rank}
          pointsString={rankItem.points.toLocaleString() + (type === 'income' ? '€' : '')}>
          {rankItem.user && <Username user={rankItem.user} />}
          {rankItem.alliance && (
            <Link to={`/ranking/alliance/${rankItem.alliance.short_name}`}>
              {rankItem.alliance.long_name} ({rankItem.alliance.short_name})
            </Link>
          )}
        </RankItem>
      ))}
    </div>
  )
}
