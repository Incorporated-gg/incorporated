import React from 'react'
import researchUtils from 'shared-lib/researchUtils'
import ResearchItem from './ResearchItem'
import CardList from '../../components/CardList'

export default function Researchs() {
  return (
    <CardList>
      {researchUtils.researchList
        .filter(b => b.id !== 5) // Hide optimize buildings research, as it's shown in buildings page
        .map(b => (
          <ResearchItem key={b.id} researchID={b.id} />
        ))}
    </CardList>
  )
}
