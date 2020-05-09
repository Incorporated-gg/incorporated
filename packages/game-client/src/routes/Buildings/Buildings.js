import React from 'react'
import Building from 'components/building'
import { buildingsList } from 'shared-lib/buildingsUtils'
import CardList from 'components/card/card-list'

export default function Buildings() {
  return (
    <CardList>
      {buildingsList.map(buildingInfo => (
        <Building key={buildingInfo.id} buildingID={buildingInfo.id} />
      ))}
    </CardList>
  )
}
