import React, { useState, useEffect, useCallback } from 'react'
import { getServerDay } from 'shared-lib/serverTime'
import api from 'lib/api'
import NewsArticle from './components/news-article'

export default function Newspaper() {
  const [day, setDay] = useState(getServerDay() - 1)
  const [newspaper, setNewspaper] = useState(false)

  const getNewspaper = useCallback(dayID => {
    setNewspaper(null)
    api
      .get('/v1/newspaper', { dayID })
      .then(res => {
        setNewspaper(res.newspaper)
      })
      .catch(err => alert(err.message))
  }, [])

  useEffect(() => {
    getNewspaper(day)
  }, [day, getNewspaper])

  return (
    <>
      <h1>The Business Journal</h1>
      <h3>
        <button onClick={() => setDay(day - 1)}>&lt;</button> Día {day}{' '}
        <button onClick={() => setDay(day + 1)}>&gt;</button>
      </h3>
      <br />
      {newspaper
        ? newspaper.news.map(newsItem => {
            return <NewsArticle key={Math.random()} article={newsItem} style={{ marginBottom: 30 }} />
          })
        : 'No encontrado'}
    </>
  )
}
