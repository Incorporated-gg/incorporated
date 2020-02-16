import React, { useState, useEffect, useCallback } from 'react'
import { get } from '../../lib/api'
import Username from '../../components/Username'
import { useLocation } from 'react-router-dom'
import styles from './Ranking.module.scss'
import RankItem from '../../components/RankItem'
import AllianceLink from 'components/alliance/alliance-link'
import { debounce } from '../../lib/utils'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [error, setError] = useState(false)
  const { pathname } = useLocation()
  let type = pathname.split('/').pop()
  if (type === 'ranking') type = 'income'
  const rankingItemType = type === 'income' || type === 'research' ? 'users' : 'alliances'

  useEffect(() => {
    get('/v1/ranking', { type })
      .then(res => {
        setRanking(res.ranking)
      })
      .catch(err => setError(err.message))
  }, [type])

  if (error) return <h4>{error}</h4>

  return (
    <>
      {rankingItemType === 'users' && <SearchUsers />}
      <div className={styles.rankingContainer}>
        {ranking.map(rankItem => (
          <RankItem
            key={rankItem.user ? rankItem.user.id : rankItem.alliance ? rankItem.alliance.id : Math.random()}
            rank={rankItem.rank}
            pointsString={rankItem.points.toLocaleString() + (type === 'income' ? '€' : '')}>
            {rankingItemType === 'users' && <Username user={rankItem.user} />}
            {rankingItemType === 'alliances' && <AllianceLink alliance={rankItem.alliance} type="shortAndLongName" />}
          </RankItem>
        ))}
      </div>
    </>
  )
}

function SearchUsers() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState()
  const [loading, setLoading] = useState()

  const doSearch = useCallback(
    debounce(username => {
      get('/v1/search', { username })
        .then(res => {
          setUsers(res.users)
          setLoading(false)
        })
        .catch(err => {
          alert(err.messsage)
          setLoading(false)
        })
    }, 500),
    []
  )

  useEffect(() => {
    setUsers()
    if (search.length < 3) return
    setLoading(true)
    doSearch(search)
  }, [doSearch, search])

  return (
    <>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={'Buscar usuario'} />
      {loading && <div>Cargando...</div>}
      {users && (
        <>
          <div className={styles.rankingContainer}>
            {users.map(user => {
              return (
                <RankItem key={user.id} rank={user.rank_position} pointsString={user.income.toLocaleString() + '€'}>
                  <Username user={user} />
                </RankItem>
              )
            })}
          </div>
          <hr />
        </>
      )}
    </>
  )
}
