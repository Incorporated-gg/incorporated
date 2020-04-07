import React from 'react'
import { personnelList } from 'shared-lib/personnelUtils'
import { useUserData } from 'lib/user'
import CardList from 'components/card/card-list'
import PersonnelItem from 'components/personnel/personnel-item/personnel-item'

export default function Personnel() {
  const userData = useUserData()

  return (
    <CardList>
      {personnelList.map(personnel => (
        <PersonnelItem
          key={personnel.resource_id}
          personnelInfo={personnel}
          resourceAmount={userData.personnel[personnel.resource_id]}
        />
      ))}
    </CardList>
  )
}
