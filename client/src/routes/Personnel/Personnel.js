import React, { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import { personnelList } from 'shared-lib/personnelUtils'
import PropTypes from 'prop-types'

export default function Personnel() {
  const [userPersonnel, setUserPersonnel] = useState([])
  const [error, setError] = useState(false)

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
          {personnelList
            ? personnelList.map(p => (
                <PersonnelType
                  key={p.id}
                  personnelData={p}
                  userPersonnel={userPersonnel}
                  reloadPersonnelData={reloadPersonnelData}
                />
              ))
            : 'No hay tropas disponibles'}
        </tbody>
      </table>
    </div>
  )
}
PersonnelType.propTypes = {
  personnelData: PropTypes.object.isRequired,
  userPersonnel: PropTypes.object.isRequired,
  reloadPersonnelData: PropTypes.func.isRequired,
}
function PersonnelType({ personnelData, reloadPersonnelData, userPersonnel }) {
  const [amount, setAmount] = useState(1)

  const doPersonnel = operationType => e => {
    e.preventDefault()
    api
      .post(`/v1/personnel/${operationType}`, { resource_id: personnelData.resource_id, amount })
      .then(() => reloadPersonnelData())
      .catch(err => {
        alert(err.message)
      })
  }
  return (
    <tr>
      <td>{personnelData.name}</td>
      <td>Price: {personnelData.price}</td>
      <td>Cur amount: {userPersonnel[personnelData.resource_id]}</td>
      <td>Coste de compra: {personnelData.price * amount}</td>
      <td>Coste de despido: {personnelData.firingCost * amount}</td>
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
