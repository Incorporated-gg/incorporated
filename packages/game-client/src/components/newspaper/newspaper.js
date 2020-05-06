import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { getServerDay } from 'lib/serverTime'
import api from 'lib/api'
import NewsArticle from './components/news-article'
import styles from './newspaper.module.scss'

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
      <NewspaperGrainFilterDeclaration />
      <div className={styles.container}>
        <div className={styles.bgImgContainer}>
          <div className={styles.bgHeader} />
          <div className={styles.bgTile} />
        </div>
        <div className={styles.contentContainer}>
          <DaySwitch day={day} setDay={setDay} />
          {newspaper
            ? newspaper.news.map((newsItem, index) => {
                return (
                  <NewsArticle key={Math.random()} article={newsItem} type={index === 0 ? 'fullwidth' : 'halfwidth'} />
                )
              })
            : 'No encontrado'}
        </div>
      </div>
    </>
  )
}

DaySwitch.propTypes = {
  day: PropTypes.number.isRequired,
  setDay: PropTypes.func.isRequired,
}
function DaySwitch({ day, setDay }) {
  return (
    <div className={styles.daySwitchContainer}>
      <button onClick={() => setDay(day - 1)}>&lt;</button> <span>DIA {day}</span>{' '}
      <button onClick={() => setDay(day + 1)}>&gt;</button>
    </div>
  )
}

function NewspaperGrainFilterDeclaration() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" height={0} width={0}>
      <defs>
        <filter id="newspaperGrainFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3" />
          <feColorMatrix type="saturate" values="0" result="generatedNoise"></feColorMatrix>
          <feComponentTransfer result="generatedNoise">
            <feFuncA type="discrete" tableValues="0.8 0 0 0.4" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="generatedNoise" operator="out" result="masked-noise" />
        </filter>
      </defs>
    </svg>
  )
}
