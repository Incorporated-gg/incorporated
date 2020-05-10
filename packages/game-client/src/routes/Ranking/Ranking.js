import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import styles from './Ranking.module.scss'
import RankItem from '../../components/UI/rank-item/rank-item'
import AllianceLink from 'components/alliance/alliance-link'
import { debounce } from '../../lib/utils'
import Pagination from 'components/UI/pagination'
import api from 'lib/api'
import UserLink from 'components/UI/user-link'
import IncInput from 'components/UI/inc-input/inc-input'
import RankingMenu from './ranking-menu'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [error, setError] = useState(false)
  const { pathname } = useLocation()
  let type = pathname.split('/').pop()
  const urlParams = new URLSearchParams(window.location.search)
  const [page, setPage] = useState(parseInt(urlParams.get('page')) || 1)
  const [maxPages, setMaxPages] = useState(1)
  const history = useHistory()
  if (type === 'ranking') type = 'income'
  const rankingItemType = type === 'income' || type === 'research' ? 'users' : 'alliances'

  useEffect(() => {
    history.push(`${pathname}?page=${page}`)
  }, [history, page, pathname])

  useEffect(() => {
    setRanking([])
    setMaxPages(1)
    api
      .get('/v1/ranking', { type, page })
      .then(res => {
        setRanking(res.ranking.listing)
        setMaxPages(res.ranking.maxPages)
      })
      .catch(err => setError(err.message))
  }, [type, page])

  if (error) return <h4>{error}</h4>

  return (
    <>
      <RankingMenu />
      {rankingItemType === 'users' && <SearchUsers />}
      <div className={styles.rankingContainer}>
        {ranking.map(rankItem => (
          <RankItem
            key={rankItem.user ? rankItem.user.id : rankItem.alliance ? rankItem.alliance.id : Math.random()}
            user={rankItem.user}
            rank={rankItem.rank}
            pointsType={type}
            points={rankItem.points}>
            {rankingItemType === 'users' && <UserLink user={rankItem.user} />}
            {rankingItemType === 'alliances' && <AllianceLink alliance={rankItem.alliance} type="shortAndLongName" />}
          </RankItem>
        ))}
      </div>
      <br />
      <Pagination onPageChange={pageNum => setPage(pageNum)} maxPages={maxPages} />
    </>
  )
}

function SearchUsers() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState()
  const [loading, setLoading] = useState()

  const doSearch = useCallback(
    debounce(username => {
      api
        .get('/v1/search', { username })
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
      <IncInput
        showBorder
        className={styles.searchUser}
        value={search}
        onChangeText={setSearch}
        placeholder={'Buscar usuario'}
      />
      {search.length >= 3 && (
        <>
          <div className={styles.rankingContainer}>
            <div>Resultados de &quot;{search}&quot;</div>
            {loading ? (
              <div>Cargando...</div>
            ) : (
              users &&
              users.map(user => {
                return (
                  <RankItem
                    key={user.id}
                    user={user}
                    rank={user.rank_position}
                    pointsType="income"
                    points={user.income}>
                    <UserLink user={user} />
                  </RankItem>
                )
              })
            )}
          </div>
        </>
      )}
    </>
  )
}
