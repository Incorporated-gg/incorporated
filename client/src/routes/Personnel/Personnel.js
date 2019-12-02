import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import { personnelList } from 'shared-lib/personnelUtils'
import PropTypes from 'prop-types'

let lastPersonnelData = {}
export default function Personnel() {
  const [userPersonnel, setUserPersonnel] = useState(lastPersonnelData)
  const [error, setError] = useState(false)

  useEffect(() => {
    lastPersonnelData = userPersonnel
  }, [userPersonnel])

  const reloadPersonnelData = useCallback(() => {
    api
      .get('/v1/personnel')
      .then(res => {
        setUserPersonnel(res.personnel)
      })
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    reloadPersonnelData()
  }, [reloadPersonnelData])

  return (
    <div>
      <h2>Personnel</h2>
      {error && <h4>{error}</h4>}
      <table>
        <tbody>
          {personnelList.map(personnel => (
            <PersonnelType
              key={personnel.id}
              personnelInfo={personnel}
              resourceAmount={userPersonnel[personnel.resource_id]}
              reloadPersonnelData={reloadPersonnelData}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

PersonnelType.propTypes = {
  personnelInfo: PropTypes.object.isRequired,
  resourceAmount: PropTypes.number.isRequired,
  reloadPersonnelData: PropTypes.func.isRequired,
}
function PersonnelType({ personnelInfo, reloadPersonnelData, resourceAmount }) {
  const [amount, setAmount] = useState(1)

  const doPersonnel = operationType => e => {
    e.preventDefault()
    api
      .post(`/v1/personnel/${operationType}`, { resource_id: personnelInfo.resource_id, amount })
      .then(() => reloadPersonnelData())
      .catch(err => {
        alert(err.message)
      })
  }
  return (
    <tr>
      <td>
        {personnelInfo.name} <b>({resourceAmount})</b>
      </td>
      <td>Coste de compra: {personnelInfo.price * amount}</td>
      <td>Coste de despido: {personnelInfo.firingCost * amount}</td>
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
