import React, { useState } from 'react'
import api from '../../lib/api'
import { personnelList } from 'shared-lib/personnelUtils'
import PropTypes from 'prop-types'
import { useUserData, reloadUserData } from '../../lib/user'

export default function Personnel() {
  const userData = useUserData()

  return (
    <table>
      <tbody>
        {personnelList.map(personnel => (
          <PersonnelType
            key={personnel.resource_id}
            personnelInfo={personnel}
            resourceAmount={userData.personnel[personnel.resource_id] || 0}
          />
        ))}
      </tbody>
    </table>
  )
}

PersonnelType.propTypes = {
  personnelInfo: PropTypes.object.isRequired,
  resourceAmount: PropTypes.number.isRequired,
}
function PersonnelType({ personnelInfo, resourceAmount }) {
  const [amount, setAmount] = useState(1)

  const doPersonnel = operationType => e => {
    e.preventDefault()
    api
      .post(`/v1/personnel/${operationType}`, { resource_id: personnelInfo.resource_id, amount })
      .then(() => reloadUserData())
      .catch(err => {
        alert(err.message)
      })
  }

  return (
    <tr>
      <td>
        {personnelInfo.name} <b>({resourceAmount})</b>
      </td>
      <td>
        <p>Coste de compra: {personnelInfo.price * amount}</p>
        <p>Coste de despido: {personnelInfo.firingCost * amount}</p>
      </td>
      <td>
        <form>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <button onClick={doPersonnel('hire')}>Contratar</button>
          <button onClick={doPersonnel('fire')}>Despedir</button>
        </form>
      </td>
    </tr>
  )
}
