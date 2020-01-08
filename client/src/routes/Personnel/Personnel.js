import React, { useState } from 'react'
import api from '../../lib/api'
import { personnelList } from 'shared-lib/personnelUtils'
import PropTypes from 'prop-types'
import { useUserData, reloadUserData } from '../../lib/user'
import { Card, Stat, cardStyles } from '../../components/Card'
import CardList from '../../components/CardList'

const personnelImages = {
  sabots: require('./img/sabot.png'),
  guards: require('./img/guard.png'),
  spies: require('./img/spy.png'),
  thiefs: require('./img/thief.png'),
}
const personnelDesc = {
  sabots: 'Matan guardias y destruyen edificios',
  guards: 'Defienden contra ataques',
  spies: 'Obtienen información privada sobre otros jugadores',
  thiefs: 'Roban dinero de edificios',
}
const personnelAccentColors = {
  sabots: '#EE5487',
  guards: '#612aab',
  spies: '#82BB30',
  thiefs: '#333',
}

export default function Personnel() {
  const userData = useUserData()

  return (
    <CardList>
      {personnelList.map(personnel => (
        <PersonnelType
          key={personnel.resource_id}
          personnelInfo={personnel}
          resourceAmount={userData.personnel[personnel.resource_id]}
        />
      ))}
    </CardList>
  )
}

PersonnelType.propTypes = {
  personnelInfo: PropTypes.object.isRequired,
  resourceAmount: PropTypes.number.isRequired,
}
function PersonnelType({ personnelInfo, resourceAmount }) {
  const [hireAmount, setHireAmount] = useState('')
  const [fireAmount, setFireAmount] = useState('')

  const hireClicked = e => {
    e.preventDefault()
    api
      .post(`/v1/personnel/hire`, { resource_id: personnelInfo.resource_id, amount: hireAmount })
      .then(() => reloadUserData())
      .catch(err => {
        alert(err.message)
      })
  }
  const fireClicked = e => {
    e.preventDefault()
    api
      .post(`/v1/personnel/fire`, { resource_id: personnelInfo.resource_id, amount: fireAmount })
      .then(() => reloadUserData())
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <Card
      image={personnelImages[personnelInfo.resource_id]}
      title={personnelInfo.name}
      subtitle={resourceAmount.toLocaleString()}
      desc={personnelDesc[personnelInfo.resource_id]}
      accentColor={personnelAccentColors[personnelInfo.resource_id]}>
      <Stat
        img={require('./img/stat-price.png')}
        title={'Coste de compra'}
        value={`${(personnelInfo.price * hireAmount).toLocaleString()}€`}
      />
      <Stat
        img={require('./img/stat-price.png')}
        title={'Mantenimiento diario'}
        value={`${(personnelInfo.dailyMaintenanceCost * hireAmount).toLocaleString()}€`}
      />
      <input
        className={cardStyles.input}
        placeholder="0"
        style={{ color: '#333' }}
        type="number"
        value={hireAmount}
        onChange={e => setHireAmount(e.target.value)}
      />
      <button
        className={cardStyles.button}
        onClick={hireClicked}
        style={{ color: personnelAccentColors[personnelInfo.resource_id] }}>
        CONTRATAR
      </button>
      <Stat
        img={require('./img/stat-price.png')}
        title={'Coste de despido'}
        value={`${(personnelInfo.firingCost * fireAmount).toLocaleString()}€`}
      />
      <input
        className={cardStyles.input}
        placeholder="0"
        style={{ color: '#333' }}
        type="number"
        value={fireAmount}
        onChange={e => setFireAmount(e.target.value)}
      />
      <button
        className={cardStyles.button}
        onClick={fireClicked}
        style={{ color: personnelAccentColors[personnelInfo.resource_id] }}>
        DESPEDIR
      </button>
      <Stat
        img={require('./img/stat-price.png')}
        title={'Coste diario actual'}
        value={`${(personnelInfo.dailyMaintenanceCost * resourceAmount).toLocaleString()}€`}
      />
    </Card>
  )
}
