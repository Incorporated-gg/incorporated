import React, { useEffect } from 'react'
import api from '../../lib/api'
import researchUtils from 'shared-lib/researchUtils'
import ResearchItem from './ResearchItem'
import { updateUserData } from '../../lib/user'

export default function Researchs() {
  useEffect(() => {
    // Update userData research info if it has changed outside of this tab
    // Will not be needed if it's eventually sent in _extra
    api
      .get('/v1/research')
      .then(res => {
        updateUserData({ researchs: res.researchs })
      })
      .catch()
  }, [])

  return (
    <div>
      {researchUtils.researchList
        .filter(b => b.id !== 5) // Hide optimize buildings research, as it's shown in buildings page
        .map(b => (
          <ResearchItem key={b.id} researchID={b.id} />
        ))}
    </div>
  )
}
