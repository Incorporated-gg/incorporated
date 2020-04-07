import React from 'react'
import { researchList } from 'shared-lib/researchUtils'
import CardList from 'components/card/card-list'
import ResearchItem from 'components/research/research-item/research-item'

export default function Researchs() {
  return (
    <CardList>
      {researchList.map(b => (
        <ResearchItem key={b.id} researchID={b.id} />
      ))}
    </CardList>
  )
}
