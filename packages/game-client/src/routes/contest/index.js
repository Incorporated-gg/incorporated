import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import Contest from './contest'

export default function ContestsRouter() {
  const [contests, setContests] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get('/v1/contests')
      .then(res => {
        setContests(res.contests)
      })
      .catch(err => setError(err.message))
  }, [])

  return (
    <>
      {error && <h4>{error}</h4>}

      {contests.length && <Contest contestName={contests[0].name} />}
    </>
  )
}
