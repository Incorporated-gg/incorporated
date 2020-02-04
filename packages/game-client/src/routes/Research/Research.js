import React from 'react'
import { researchList } from 'shared-lib/researchUtils'
import ResearchItem from './ResearchItem'
import CardList from '../../components/CardList'

export default function Researchs() {
  return (
    <CardList>
      {researchList
        .filter(b => !b.showAsBuilding) // Hide researchs shown in buildings page
        .map(b => (
          <ResearchItem key={b.id} researchID={b.id} />
        ))}
    </CardList>
  )
}
