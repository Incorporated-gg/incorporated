import React from 'react'
import { personnelObj } from 'shared-lib/personnelUtils'
import { useUserData } from 'lib/user'
import CardList from 'components/card/card-list'
import PersonnelItem from 'components/personnel/personnel-item/personnel-item'

export default function Personnel() {
  const userData = useUserData()

  return (
    <CardList>
      {Object.values(personnelObj).map(personnelInfo => (
        <PersonnelItem
          key={personnelInfo.resource_id}
          personnelInfo={personnelInfo}
          resourceAmount={userData.personnel[personnelInfo.resource_id]}
        />
      ))}
    </CardList>
  )
}
